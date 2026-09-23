"""Builds readable HTML versions of the user guides (double-click to open on a Mac).
Run: python3 scripts/build-guide.py   (needs: pip install markdown)"""
import markdown, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent

def build(name, title, kicker):
  md = (root / f"{name}.md").read_text()
  # Python-Markdown needs a blank line before a list and 4-space nesting; GitHub doesn't. Normalise.
  out, fence, prev = [], False, ""
  item = re.compile(r"^\s*([-*]|\d+\.) ")
  for line in md.split("\n"):
      if line.lstrip().startswith("```"):
          fence = not fence
      if not fence:
          m = re.match(r"^( {2,3})(\S.*)$", line)
          if m:
              line = "    " + m.group(2)
          if item.match(line) and prev.strip() and not item.match(prev) and not prev.startswith("    ") and not prev.startswith("|"):
              out.append("")
      out.append(line)
      prev = line
  md = "\n".join(out)
  body = markdown.markdown(md, extensions=["tables", "fenced_code", "sane_lists"])
  # Colour-code the "where to type" labels
  body = body.replace("🖥 Terminal", '<span class="tag term">🖥 Terminal</span>')
  body = body.replace("🤖 Claude Code", '<span class="tag cc">🤖 Claude Code</span>')
  body = body.replace("🌐 Browser", '<span class="tag web">🌐 Browser</span>')
  body = body.replace("💬 Claude chat", '<span class="tag app">💬 Claude chat</span>')
  # Tick boxes: "- [ ] text" becomes a checkbox the reader can tick (saved in the browser)
  tasks = [0]
  def add_task(m):
      tasks[0] += 1
      return f'<li class="task"><input type="checkbox" data-k="{tasks[0]}" aria-label="Done"> '
  body = re.sub(r"<li>\[ \] ", add_task, body)
  # Build a table of contents from the h2 headings
  toc, n = [], 0
  def add_id(m):
      nonlocal n
      n += 1
      text = re.sub("<[^>]+>", "", m.group(1))
      toc.append(f'<li><a href="#s{n}">{text}</a></li>')
      return f'<h2 id="s{n}">{m.group(1)}</h2>'
  body = re.sub(r"<h2>(.*?)</h2>", add_id, body)
  if len(toc) < 4:
      sub = [0]
      def add_sub(m):
          sub[0] += 1
          text = re.sub("<[^>]+>", "", m.group(1))
          toc.append(f'<li style="margin-left:1.2em;list-style:none"><a href="#h{sub[0]}">{text}</a></li>')
          return f'<h3 id="h{sub[0]}">{m.group(1)}</h3>'
      parts = re.split(r'(<h2 id="s\d+">.*?</h2>)', body)
      toc.clear(); out = []
      for part in parts:
          mm = re.match(r'<h2 id="(s\d+)">(.*?)</h2>', part)
          if mm:
              toc.append(f'<li><a href="#{mm.group(1)}">{re.sub("<[^>]+>", "", mm.group(2))}</a></li>')
              out.append(part)
          else:
              out.append(re.sub(r"<h3>(.*?)</h3>", add_sub, part))
      body = "".join(out)
  html = f"""<!doctype html>
  <html lang="en-GB"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
  :root {{ --bg:#F4F0E8; --panel:#FFFDF8; --text:#1B1816; --dim:#5E5750; --line:rgba(27,24,22,.12);
    --brass:#8A6A35; --code:#EDE6D9; --term:#2F5D50; --cc:#7A4E2D; --web:#2F4F7A; --app:#6A3F75; }}
  @media (prefers-color-scheme: dark) {{ :root {{ --bg:#121110; --panel:#1C1917; --text:#EFEAE1; --dim:#A69E92;
    --line:rgba(239,234,225,.12); --brass:#D9B77E; --code:#2B211D; --term:#9CCBB9; --cc:#E3B08A; --web:#A9C3E8; --app:#D4AEDD; }} }}
  * {{ box-sizing:border-box }}
  body {{ margin:0; background:var(--bg); color:var(--text); font:17px/1.6 -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif; }}
  main {{ max-width:820px; margin:0 auto; padding:32px 16px 96px; }}
  h1 {{ font:400 2.4rem/1.15 "New York", "Iowan Old Style", Georgia, serif; margin:.2em 0 .4em; }}
  h2 {{ font:400 1.7rem/1.2 "New York", "Iowan Old Style", Georgia, serif; margin:2.2em 0 .5em; padding-top:.6em; border-top:1px solid var(--line); }}
  h3 {{ font-size:1.1rem; margin:1.6em 0 .4em; }}
  a {{ color:var(--brass); }}
  hr {{ display:none; }}
  code {{ font:0.92em ui-monospace, "SF Mono", Menlo, monospace; background:var(--code); padding:.1em .35em; border-radius:4px; }}
  pre {{ position:relative; background:var(--code); padding:14px 16px; border-radius:8px; overflow-x:auto; border:1px solid var(--line); }}
  pre code {{ background:none; padding:0; font-size:.95rem; }}
  .copy {{ position:absolute; top:8px; right:8px; font:600 12px -apple-system, sans-serif; color:var(--text); background:var(--panel);
    border:1px solid var(--line); border-radius:999px; padding:4px 10px; cursor:pointer; }}
  .copy:focus-visible {{ outline:2px solid var(--brass); outline-offset:2px; }}
  table {{ border-collapse:collapse; width:100%; margin:1em 0; font-size:.95rem; display:block; overflow-x:auto; }}
  th, td {{ text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top; }}
  blockquote {{ margin:1em 0; padding:12px 16px; background:var(--panel); border-left:3px solid var(--brass); border-radius:0 8px 8px 0; }}
  blockquote p {{ margin:0; }}
  .tag {{ display:inline-block; font-weight:600; font-size:.85em; padding:1px 8px; border-radius:999px; border:1px solid currentColor; white-space:nowrap; }}
  .term {{ color:var(--term) }} .cc {{ color:var(--cc) }} .web {{ color:var(--web) }} .app {{ color:var(--app) }}
  nav {{ background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 20px; }}
  nav ol {{ margin:.4em 0; padding-left:1.2em; }}
  nav li {{ margin:.15em 0; }}
  .kicker {{ color:var(--dim); font-size:.9rem; letter-spacing:.08em; text-transform:uppercase; margin-top:0; }}
  li.task {{ list-style:none; margin-left:-1.5em; padding-left:1.9em; text-indent:-1.9em; }}
  li.task input {{ width:18px; height:18px; margin:0 .6em 0 0; vertical-align:-3px; accent-color:var(--brass); cursor:pointer; }}
  li.task.done {{ color:var(--dim); }}
  li.task ul, li.task ol {{ text-indent:0; margin-top:.3em; }}
  .meter {{ position:sticky; top:0; z-index:5; display:flex; align-items:center; gap:12px; background:var(--bg); padding:10px 0; border-bottom:1px solid var(--line); font-size:.9rem; color:var(--dim); }}
  .meter .bar {{ flex:1; height:6px; border-radius:9px; background:var(--code); overflow:hidden; }}
  .meter .bar i {{ display:block; height:100%; width:0; background:var(--brass); }}
  .meter button {{ font:inherit; color:var(--text); background:var(--panel); border:1px solid var(--line); border-radius:999px; padding:3px 12px; cursor:pointer; }}
  @media print {{ .copy, nav, .meter {{ display:none }} body {{ font-size:12pt }} li.task input {{ -webkit-print-color-adjust:exact; }} }}
  </style></head>
  <body><main>
  <p class="kicker">{kicker}</p>
  {body.replace('</h1>', '</h1><nav aria-label="Contents"><strong>Contents</strong><ol>' + ''.join(toc) + '</ol></nav>', 1)}
  </main>
  <script>
  (function(){{
    const boxes=[...document.querySelectorAll('li.task input')];
    if(!boxes.length) return;
    const key='atelier-six-{name}-ticks';
    let saved={{}};
    try {{ saved=JSON.parse(localStorage.getItem(key)||'{{}}'); }} catch(e) {{}}
    const meter=document.createElement('div'); meter.className='meter'; meter.setAttribute('role','status');
    meter.innerHTML='<span class="count"></span><span class="bar"><i></i></span><button type="button">Clear ticks</button>';
    document.querySelector('nav').after(meter);
    const update=()=>{{
      const n=boxes.filter(b=>b.checked).length;
      meter.querySelector('.count').textContent=n+' of '+boxes.length+' done';
      meter.querySelector('i').style.width=(100*n/boxes.length)+'%';
      boxes.forEach(b=>b.closest('li').classList.toggle('done',b.checked));
    }};
    boxes.forEach(b=>{{
      b.checked=!!saved[b.dataset.k];
      b.addEventListener('change',()=>{{ saved[b.dataset.k]=b.checked; try {{ localStorage.setItem(key,JSON.stringify(saved)); }} catch(e) {{}} update(); }});
    }});
    meter.querySelector('button').addEventListener('click',()=>{{
      if(!confirm('Clear every tick on this page?')) return;
      saved={{}}; boxes.forEach(b=>b.checked=false); try {{ localStorage.removeItem(key); }} catch(e) {{}} update();
    }});
    update();
  }})();
  document.querySelectorAll('pre').forEach(pre => {{
    const b = document.createElement('button');
    b.className = 'copy'; b.type = 'button'; b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy this command');
    b.onclick = async () => {{
      const text = pre.querySelector('code').innerText.replace(/\\n$/, '');
      try {{ await navigator.clipboard.writeText(text); }} catch (e) {{
        const r = document.createRange(); r.selectNodeContents(pre.querySelector('code'));
        const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); s.removeAllRanges();
      }}
      b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1500);
    }};
    pre.appendChild(b);
  }});
  </script>
  </body></html>"""
  (root / f"{name}.html").write_text(html)
  print(f"wrote {name}.html", len(html)//1024, "KB")


build("MAC-GUIDE", "Atelier Six Mac Guide", "Atelier Six · build guide")
build("DRIVE-AND-AUTOPILOT", "Drive and Autopilot", "Atelier Six · external drive and hands-off building")
build("WALKTHROUGH", "Atelier Six Walkthrough", "Atelier Six · start to finish")
