"""Validate CarCompass car entries against the handoff schema."""
import json, sys

FUEL = {"petrol", "diesel", "hybrid", "plugin-hybrid", "electric"}
GB = {"manual", "automatic"}
BODY = {"hatchback", "sedan", "wagon", "suv", "coupe", "convertible", "mpv"}
VERDICT = {"recommended", "caution", "avoid"}
FIT = {"good", "ok", "poor"}
FREQ = {"rare", "common", "very-common"}
SEV = {"minor", "costly", "major"}
ROLE = {"main", "interior", "rear", "other"}
CONF = {"high", "medium", "low"}


def check(cars, all_ids=None, strict_alts=False):
    errs = []
    ids = [c["id"] for c in cars]
    if len(ids) != len(set(ids)):
        errs.append("duplicate ids")
    known = set(all_ids or ids)

    def e(c, msg):
        errs.append(f"{c.get('id')}: {msg}")

    def num(c, v, name, allow_null=False):
        if v is None and allow_null:
            return
        if not isinstance(v, (int, float)) or isinstance(v, bool):
            e(c, f"{name} not a number: {v!r}")

    def ln(c, s, n, name):
        if not isinstance(s, str):
            e(c, f"{name} not string")
        elif len(s) > n:
            e(c, f"{name} too long ({len(s)}>{n}): {s}")

    for c in cars:
        for k in ["id", "make", "model", "generation", "years", "engine", "gearboxes", "bodyTypes", "seats",
                  "bootLitres", "ratings", "prices", "priceSource", "costs", "problems", "pros", "cons",
                  "verdictText", "ownerSummary", "alternatives", "checklist", "photos", "sources", "confidence"]:
            if k not in c:
                e(c, f"missing {k}")
        num(c, c["years"]["from"], "years.from"); num(c, c["years"]["to"], "years.to")
        en = c["engine"]
        if en["fuel"] not in FUEL: e(c, "bad fuel")
        num(c, en["powerHp"], "powerHp"); num(c, en["torqueNm"], "torqueNm", True)
        num(c, en["zeroToHundredSec"], "0-100")
        num(c, en["consumptionL100km"], "l/100", True); num(c, en["consumptionKwh100km"], "kwh", True)
        if en["fuel"] == "electric" and en["consumptionL100km"] is not None: e(c, "electric with l/100")
        if en["fuel"] != "electric" and en["consumptionKwh100km"] is not None: e(c, "kwh on non-electric")
        for g in c["gearboxes"]:
            if g["type"] not in GB: e(c, "bad gearbox type")
        for b in c["bodyTypes"]:
            if b not in BODY: e(c, f"bad body {b}")
        num(c, c["seats"], "seats", True); num(c, c["bootLitres"], "boot", True)
        r = c["ratings"]
        if not isinstance(r["reliability"], int) or not 1 <= r["reliability"] <= 10: e(c, "bad reliability")
        if r["verdict"] not in VERDICT: e(c, "bad verdict")
        for k in ["city", "highway", "mixed"]:
            if r["usageFit"][k] not in FIT: e(c, f"bad usageFit {k}")
        if not 3 <= len(c["prices"]) <= 5: e(c, "prices count")
        for p in c["prices"]:
            for k in ["year", "mileageKm", "priceEur"]: num(c, p[k], f"prices.{k}")
        num(c, c["costs"]["maintenancePerYearEur"], "maintenance")
        if not 2 <= len(c["costs"]["commonParts"]) <= 5: e(c, "commonParts count")
        for p in c["costs"]["commonParts"]:
            num(c, p["costEurMin"], "part min"); num(c, p["costEurMax"], "part max"); num(c, p["intervalKm"], "interval", True)
            if p["costEurMin"] > p["costEurMax"]: e(c, f"part min>max {p['item']}")
        if not 3 <= len(c["problems"]) <= 8: e(c, "problems count")
        pids = [p["id"] for p in c["problems"]]
        if len(pids) != len(set(pids)): e(c, "dup problem ids")
        for p in c["problems"]:
            ln(c, p["name"], 40, "problem.name"); ln(c, p["explanation"], 140, "problem.explanation")
            ln(c, p["howToCheck"], 140, "problem.howToCheck")
            num(c, p["mileageKmFrom"], "mileFrom"); num(c, p["mileageKmTo"], "mileTo", True)
            num(c, p["repairCostEurMin"], "repMin"); num(c, p["repairCostEurMax"], "repMax")
            if p["repairCostEurMin"] > p["repairCostEurMax"]: e(c, f"repair min>max {p['id']}")
            if p["frequency"] not in FREQ: e(c, "bad freq")
            if p["severity"] not in SEV: e(c, "bad severity")
            if not 1 <= len(p["symptoms"]) <= 3: e(c, f"symptoms count {p['id']}")
            for s in p["symptoms"]: ln(c, s, 60, "symptom")
            if "appliesTo" not in p: e(c, "appliesTo missing")
        if not 3 <= len(c["pros"]) <= 5: e(c, "pros count")
        if not 3 <= len(c["cons"]) <= 5: e(c, "cons count")
        for s in c["pros"] + c["cons"]: ln(c, s, 60, "pro/con")
        ln(c, c["verdictText"], 200, "verdictText"); ln(c, c["ownerSummary"], 300, "ownerSummary")
        alts = c["alternatives"]
        if r["verdict"] in ("caution", "avoid") and not 1 <= len(alts) <= 3: e(c, "needs 1-3 alternatives")
        for a in alts:
            ln(c, a["reason"], 100, "alt.reason")
            if strict_alts and a["id"] not in known: e(c, f"unknown alt id {a['id']}")
            if a["id"] == c["id"]: e(c, "self alternative")
        ck = c["checklist"]
        if not 3 <= len(ck["checks"]) <= 6: e(c, "checks count")
        if not 1 <= len(ck["documents"]) <= 4: e(c, "documents count")
        if not 1 <= len(ck["redFlags"]) <= 4: e(c, "redFlags count")
        for s in ck["checks"]: ln(c, s, 120, "check")
        for s in ck["documents"]: ln(c, s, 100, "document")
        for s in ck["redFlags"]: ln(c, s, 120, "redFlag")
        if not 1 <= len(c["photos"]) <= 3: e(c, "photos count")
        if c["photos"] and c["photos"][0]["role"] != "main": e(c, "first photo not main")
        for ph in c["photos"]:
            if ph["role"] not in ROLE: e(c, "bad photo role")
            if not ph["fileUrl"].startswith("https://upload.wikimedia.org/"): e(c, "fileUrl not upload.wikimedia")
            if not ph["pageUrl"].startswith("https://commons.wikimedia.org/wiki/File:"): e(c, "pageUrl not commons")
        if not 2 <= len(c["sources"]) <= 4: e(c, "sources count")
        if c["confidence"]["overall"] not in CONF: e(c, "bad confidence")
    return errs


if __name__ == "__main__":
    path = sys.argv[1]
    data = json.load(open(path, encoding="utf-8"))
    strict = "--strict" in sys.argv
    errs = check(data, strict_alts=strict)
    print("\n".join(errs) if errs else f"OK: {len(data)} cars valid")
    sys.exit(1 if errs else 0)
