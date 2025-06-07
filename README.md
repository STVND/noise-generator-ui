noise-generator-ui
---
simple website that can create simple noise images that have dimensions that are (2^n)*(2^n)(up to n = 9) pixels large.

Requirements
---
>[Docker](https://docs.docker.com/engine/install/)


Instructions
---
Just clone this repository, open your terminal in the repository and run something like:
```
docker build . -t "noise-generator-ui"

```

Then, assuming the build went correctly, you can run

```
docker run -p 3000:5173 "noise-generator-ui"
```

and connect to the website by typing
```
http://localhost:3000 
```
into your browser and start generating noise textures

Why make noise?
---
Noise textures can be pretty helpful for digital art and real-time applications involving graphics(games).

About
---
This website runs on the CPU and it runs fast enough until you start generating 512x512 or above and then you start getting some noticeable slowdown.
Fortunately most noise textures don't need to be above 32x32 for a lot of uses.

Limitations
---
Currently only supports White Noise and Simplex noise which is probably good enough but I think it would be ideal to add Worley(Voronoi) noise and then Simplex-Worley noise for more [complex effects](https://www.guerrilla-games.com/read/the-real-time-volumetric-cloudscapes-of-horizon-zero-dawn)

Doesn't actively support exposed parameters due to a reliance on existing noise libraries that don't have them exposed but I suppose if I have a free weekend or two I might be able to add support for them.
