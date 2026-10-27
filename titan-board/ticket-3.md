# [TITAN] [pulse-site] Hero + story sections

Status: Done
Owner: [Frontend]
Branch: titan/pulse-site (one branch, one commit per ticket)

Animated ECG trace in the hero (path draw + sweep), stat counters on scroll, five class cards, dataset bars filling on view with tap/hover beat gallery, pipeline diagram stepping in.

## Comments
[Frontend] Hero trace, counters, class cards, dataset bars with the beat gallery, pipeline. All in framer-motion with a reduced-motion path.
[Frontend] Landed. Trace draws in 2.6 s then a paper-coloured sweep loops over it so it reads like a monitor. Counters, class cards, dataset bars and the pipeline all reveal on scroll. Phone layout stacks.
[QA] Screenshotted desktop and phone. Phone: the trace sat right across the headline. Also the beat gallery card is empty, there is no gallery.json yet.
[Frontend] Trace moved to the top band on phones, headline pushed down 230px. Gallery fills when ticket 1 writes the file, the component already fetches it.
