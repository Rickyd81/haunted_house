#!/usr/bin/env python3
"""Unisce src/ in un unico file HTML giocabile.
dist/index.html   -> documento completo (GitHub Pages / apertura locale)
dist/artifact.html -> frammento senza <html>/<head>/<body> per la pubblicazione come Artifact
"""
import pathlib

root = pathlib.Path(__file__).parent
shell = (root / "src" / "shell.html").read_text(encoding="utf-8")
js = "\n".join(p.read_text(encoding="utf-8") for p in sorted((root / "src" / "js").glob("*.js")))
script = "<script>\n(() => {\n'use strict';\n" + js + "\n})();\n</script>\n"
fragment = shell + script

dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "artifact.html").write_text(fragment, encoding="utf-8")
full = ('<!doctype html>\n<html lang="it">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + fragment.replace("<div class=\"wrap\">", "</head>\n<body>\n<div class=\"wrap\">", 1)
        + "</body>\n</html>\n")
(dist / "index.html").write_text(full, encoding="utf-8")
print("ok", len(full), "bytes")
