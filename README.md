# HSK 4 系统学习 · Học HSK 4 có hệ thống

Static study site for HSK 4: a 10-week plan, 602 words, 100 grammar points, flashcards, a placement test, lesson quizzes, a study pet and rewards.

- `/` is the Chinese–Vietnamese version (中文–Tiếng Việt)
- `/en/` is the Chinese–English version
- `/preview/` and `/preview/en/` redirect to `/` and `/en/` (the preview QR still works). Query strings such as `?event=` and `?teacher=1` are kept.

Plain static files with no server and no tracking. Progress is saved in the browser's localStorage under the `hsk4-` keys (study plan, quizzes, test history, settings and the pet).
Built from `source/` with `python3 source/build.py`, which needs Node, `react`, `react-dom` and `esbuild`.
