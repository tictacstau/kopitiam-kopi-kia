---
title: "Fifty Commits: What I Learned Vibe Coding a Kopitiam Game with an LLM"
date: 2026-08-24
author: Tictacstau
summary: "Kopi Kia went from empty folder to App Store candidate in fifty commits and about three weeks. Here is what the LLM was genuinely good at, where it quietly wasted my time, and the parts nobody tells you about."
tags: [devlog, vibe-coding, llm, gamedev]
cover: /play/assets/sprites/kopitiam_cover_art.jpg
_editorNote: "DRAFT — every fact here is pulled from the real git history, but the opinions are a starting point. Rewrite them in your own voice before you publish. Delete this line when you are happy with it."
---

I built **Kopi Kia**, a Singapore hawker coffee simulation game, almost entirely by talking to a large language model. Fifty commits, roughly three weeks, from an empty folder to something sitting in the App Store submission queue.

This is not a post about whether vibe coding "works." It obviously works — the game exists, you can play it. This is a post about what it actually felt like, and about the specific places where the whole approach either shone or fell over.

## The shape of the work

The commit history tells the story better than I could. Three weeks, but they were not evenly spread:

- **2 August** — three commits establishing the vintage parchment theme
- **5 August** — a full real-time 3D WebGL mug engine, in a single commit
- **7 August** — nine commits: sprites, splash screens, cover art, social preview cards
- **11 August** — twenty-eight commits
- **20 August** — one commit, changing the text on a coffee cup

That 11 August spike is the entire story of vibe coding in one line. Twenty-eight commits in a day is not a productivity flex. It is what happens when the feedback loop between "I notice something" and "it is fixed" collapses to about ninety seconds, and you spend a whole day noticing things.

## What the model was genuinely great at

**Breadth I did not have.** I know how to build a web app. I did not know how to write a Three.js scene with volumetric liquid layers, sloshing wave physics, floating ice cubes and a steam particle system. That arrived in one commit on 5 August and it worked. The 3D mug in the middle of the screen — where you watch the kopi layer sit on top of the condensed milk before you stir — is the single best thing in the game, and I would never have built it alone. Not because it is beyond me, but because the activation energy would have killed it at the idea stage.

**Domain detail, done properly.** The kopitiam ordering system is a real language. *Kopi-C Siew Dai* is coffee with evaporated milk and less sugar. *Kosong* is empty — no sugar. *Peng* is iced. *Yuan Yang* is coffee and tea in the same cup. Getting sixteen recipes right, each with its own combination of brew, milk type, sugar level and ice, plus prices that feel like actual hawker centre prices, is exactly the kind of tedious structured data work that a model does faster and more accurately than I do at 1am.

**Never being bored.** The eleventh time I said "the button is still cropped on my phone," it tried again with the same energy as the first time. There is real value in a collaborator with no ego about its own previous attempt.

## Where it quietly cost me time

**It cannot see.** This is the big one. The model wrote CSS for a screen it could not look at. So I got a run of commits like:

> `fix: Add background-image URL and iOS safe-area-inset-top padding to prevent header notch overlap`
>
> `fix: Add safe-area-inset-bottom and compact button height to prevent Serve Order cropping on iPhone 17 Pro`
>
> `fix: Prevent poster background text cropping on tall iPhone screens`
>
> `fix: Recalibrate splash and menu poster backgrounds`

Four separate commits, all the same underlying problem: things do not fit on a real phone. Each fix was plausible, well-reasoned, and only partially right, because I was the only one in the loop who could actually see the screen. I was the eyes, and I was the bottleneck. The moment I started sending screenshots instead of describing the problem, this class of bug largely stopped.

**It breaks things it cannot test.** One commit reads `fix: Update dead vintage_kopitiam_poster.jpg to assets/sprites/kopitiam_cover_art.jpg`. An earlier reorganisation had moved image files and left a reference pointing at nothing. The code was still valid. The page still loaded. It just had a blank background, and nothing in the toolchain complained. Same story with `fix: Resolve missing DOM element references in openBoardModal to fix Board button click` — a button that did nothing at all, shipped, because nobody clicked it.

The pattern: LLMs write code that is *syntactically confident and semantically unverified*. If your project has no tests — and mine did not, for most of its life — you are the test suite, and you will miss things.

**Deployment is where it hallucinates hardest.** There is a five-commit stretch on 11 and 12 August that is nothing but a fight with Vercel over how to serve a privacy policy page at `/privacy`:

> add vercel.json rewrite → update vercel.json routes → remove vercel.json entirely → update build script → configure outputDirectory

Every single one of those was proposed with total confidence. Config for a specific platform, at a specific version, is exactly where a model's training data goes stale and it starts pattern-matching on plausible-looking YAML. The fix was to stop asking and go read Vercel's actual documentation for ten minutes.

## The thing nobody warns you about

Somewhere around 4 August I built an **"Autonomous Agentic UI/UX Optimization Loop"** — a system that audited my own interface for touch target sizes, contrast ratios and thumb-zone ergonomics, then applied fixes. It ran a perceive-reason-act cycle. It was genuinely clever.

On 7 August I removed its button from the production UI.

That is the real hazard of building with an LLM. The marginal cost of a feature drops so low that you build things because you *can*, not because the game needs them. A coffee game did not need a self-auditing agentic design system. It needed the Serve button to not get cut off by the home indicator. When everything is cheap to build, taste — knowing what to *not* build — becomes the entire job.

The code is still in the repo. I have not deleted it. I am not sure what that says about me.

## What I would tell someone starting today

1. **Screenshots beat descriptions.** Every round trip where you describe a visual bug in words is a round trip you will repeat. Show, do not tell.
2. **Write the data model yourself, or at least review it line by line.** The sixteen recipes are the spine of this game. If they had been subtly wrong, everything built on top would have been subtly wrong.
3. **Do not let it near your deploy config unsupervised.** Read the platform docs yourself. This is the highest-confidence, lowest-accuracy zone.
4. **Commit constantly, in small pieces.** Fifty commits for a small game sounds excessive. It meant that every bad idea was one `git revert` away from gone, which is what made it safe to move fast.
5. **The bottleneck moves to you.** It is not writing code any more. It is deciding what is worth building, and noticing what is broken. Both of those are still entirely your job.

## Where it is now

Kopi Kia is live and playable in the browser. Ten hawker centres, sixteen drinks, three stations, a 3D mug and Uncle Lim shouting at you when you are too slow. The iOS build is assembled and queued.

You can see exactly what is finished and what I am still working on [on the roadmap](/roadmap.html), which I am keeping honest — including the parts of the game that are half-wired right now.

Go make yourself a Kopi-O first, though. You will want the practice.
