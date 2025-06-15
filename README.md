## Texture-Toolkit

simple website that can create simple noise images and some

### Requirements

For self hosting you'll need docker:
>[Docker](https://docs.docker.com/engine/install/)


(Or you can just visit the website: https://stvnd.github.io/texture-toolkit/)


Instructions
###
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

### About Noise

#### Why Noise?
Noise textures can be pretty helpful for digital art and real-time applications involving graphics(games).

#### Limitations
Supports Simplex, Worley and a lazy implementation of white noise. 

White noise is technically random at every point so doesn't have any settings that affect tiling. 

Worley is tileable regardless of inputs and can emulate continuous noise like simplex if the density is high enough.

Simplex is a little tricky because it technically doesn't tile but appears to at lower resolutions. When using a really high resolution texture it's recommended to slide density to 1.0

### About Pigments

#### Why Pigments?
Computers mix colors in a weird way that isn't super intuitive. This implmentation reconstructs pigments and your pc will blend colors like they are physical media.

#### Limitations
It's technically limited by my implementation of the 3 primary colors and black and white. So you are, by default, limiting your color output by how I decide to mix them and how I am best able to get them to mix.
So you can achieve *every* color, but only within the color space that exists between all these colors.

These are the most important parts but you can see a little more at the actual [repo](https://github.com/STVND/davis-pigment-mixing)

### About Everything
This website exclusively uses TypeScript(and GLSL) so that it can be deployed on GitHub Pages and it runs fast enough until you start generating 512x512 or above and then you start getting some noticeable slowdown.
Fortunately most noise textures don't need to be above 32x32 for a lot of uses.

If you're using mobile to preview the site, you're going to have a rough time and just about everything will not work. Unfortunately there just aren't any plans to support mobile browsers at this time as it's a little unlikely to be the use case.

### Future Plans
Nothing too solid right now but I was thinking of making a swatch generator to go along the pigment mixer but there doesn't seem to be a standard swatch file for every software.

Anything else that comes along while I do my little art pieces that would fit in the scope of a texture tool.

Anything that gets submitted and seems to fall in the scope of a texture tool.