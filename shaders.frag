#ifdef GL_ES
precision mediump float;
#endif


const float PI = 3.1415926535;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform sampler2D u_tex0; // Monalisa-01_superres_petfal.png

float noise1d(float v)
{
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float random2d(vec2 coord)
{
    return fract(sin(dot(coord.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float circleShape(vec2 position, float radius)
{
    // step function
    // returns 0 for points inside circle
    // returns 1 otherwise
    return 1. - step(radius, length(position - vec2(0.5))); 
}

float rectShape(vec2 coord, vec4 sides)
{
    // sides: x1, y1, x2, y2
    vec2 hv = step(sides.xy, coord) * step(coord, sides.zw);
    return hv.x * hv.y;
}

float polygonShape(vec2 position, float radius, float sides)
{
    position = position * 2.0 - 1.0; // centers the polygon
    float angle = atan(position.x, position.y);
    float polyAngles = PI * 2.0 / sides; // gets the radians of every slice
    // floor(0.5 + angle / polyAngles) * polyAngles - angle
    // rounds the angles so the sides are flat
    // cos(.) * length(position) 
    // distance from center aleg angle
    return step(radius, cos(floor(0.5 + angle / polyAngles) * polyAngles - angle) * length(position));
}

/*
 * Zooms the canvas in or out
 */
vec2 izoom(vec2 coord, float z)
{
    return coord * z;
}

/*
 * Translates the coordinates in the x and y axis
 */
vec2 translate(vec2 coord, vec2 translation)
{
    return coord + translation * 0.5;
}

/*
 * Scales the coordinates in the x and y axis
 */
vec2 scale(vec2 coord, vec2 scale)
{
    coord -= vec2(0.5);
    coord = mat2(scale.x + 2.0, 0.0, 0.0, scale.y + 2.0) * coord;
    coord += vec2(0.5);
    return coord;
}

/*
 * Rotates the coordinates in the x and y axis
 */
vec2 rotate(vec2 coord, float angle)
{
    coord -= 0.5;
    // rotation matrix
    coord = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * coord;
    coord += 0.5;
    return coord;
}

/*
 * Creates a warp grid
 */
vec3 warpGrid(vec2 coord, vec3 color)
{
    color += sin(coord.x * cos(u_time / 30.0) * 60.0) + 
        sin(coord.y * cos(u_time / 15.0) * 10.0);
    color += cos(coord.x * sin(u_time / 30.0) * 20.0) + 
        cos(coord.y * sin(u_time / 15.0) * 60.0);

    // mist effect
    //color *= sin(u_time / 10.0) * 0.5;
    
    return color;
}

/*
 * Creates a water color like pattern
 */
vec3 waterColor(vec2 coord, vec3 color, int N, vec2 c1, vec3 rgb)
{
    coord = izoom(coord, 15.0);

    for(int n = 1; n < 5; n++)
    {
        float i = float(n);
        coord += vec2(c1.x + c1.y / i * sin(i * coord.y + u_time + 0.3 * i), 
            c1.x + c1.y / i * sin(coord.x + u_time + 0.3 * i));
    }
    
    coord += vec2(c1.x + c1.y / sin(coord.y + u_time + 0.3), 
            c1.x + c1.y / sin(coord.x + u_time + 0.3));
    color = vec3(rgb.r * sin(coord.x) + rgb.r, 
        rgb.g * sin(coord.y) + rgb.y, 
        rgb.b * sin(coord.x + coord.y));
    return color;
}

/*
 * Creates a water color like pattern
 */
vec3 waterColor(vec2 coord, vec3 color)
{
    return waterColor(coord, color, 8, vec2(0.8, 1.0), vec3(0.5, 0.5, 1.0));
}

/*
 * Creates a water color like pattern
 */
vec3 waterColor2(vec2 coord, vec3 color, int amount, vec3 rgb)
{
    coord = izoom(coord, 20.0);
    
    float len = 0.0;

    for(int i = 0; i < 5; i++){
        len = length(coord.xy);
        coord.x = coord.x - cos(coord.y + sin(len)) + cos(u_time / 5.0);
        coord.y = coord.y + sin(coord.x + cos(len)) + sin(u_time / 6.0);
    }

    return vec3(cos(len * rgb));
}  

/*
 * Creates a water color like pattern
 */
vec3 waterColor2(vec2 coord, vec3 color)
{
    return waterColor2(coord, color, 6, vec3(2.0, 3.0, 1.5));
}

/*
 * Creates warped vertical lines
 */
vec3 warpVerticalLines(vec2 coord, float a1, float b1, float a2, float b2)
{
    float fcolor = 0.0;
    fcolor += 2.0 * sin(coord.x * a1 + cos(u_time + coord.y * 10.0 + 
        sin(coord.x + 50.0 + u_time * 2.0)));
    fcolor += 2.0 * cos(coord.x * b2 + sin(u_time + coord.y * 10.0 + 
        cos(coord.x + 50.0 + u_time * 2.0)));
    fcolor += 2.0 * sin(coord.x * a2 + cos(u_time + coord.y * 10.0 + 
        sin(coord.x + 50.0 + u_time * 2.0)));
    fcolor += 2.0 * cos(coord.x * b2 + sin(u_time + coord.y * 10.0 + 
        cos(coord.x + 50.0 + u_time * 2.0)));

    return vec3(fcolor + coord.x, fcolor + coord.y, fcolor);
}

/*
 * Creates warped horizontal lines
 */
vec3 warpHorizontalLines(vec2 coord, float a1, float b1, float a2, float b2)
{
    float fcolor = 0.0;
    fcolor += 0.5 * sin(coord.x * 6.0 + sin(u_time + coord.y * a1 + 
        cos(coord.x * 30.0 + u_time * 2.0)));
    fcolor += 0.5 * cos(coord.x * 6.0 + cos(u_time + coord.y * b1 + 
        sin(coord.x * 30.0 + u_time * 2.0)));
    fcolor += 0.5 * sin(coord.x * 6.0 + sin(u_time + coord.y * a2 + 
        cos(coord.x * 30.0 + u_time * 2.0)));
    fcolor += 0.5 * cos(coord.x * 6.0 + cos(u_time + coord.y * b2 + 
        sin(coord.x * 30.0 + u_time * 2.0)));

    return vec3(1. - fcolor + coord.x, 1. - fcolor + coord.y, 1. - fcolor);
}

/*
 * Creates a colorful swirl shape
 */
vec3 swirl(vec2 coord, vec2 pos, float a1, float a2, float a3)
{
    float angle = atan(-coord.y + pos.x, coord.x - pos.y) * 0.5;
    float len = length(coord - vec2(pos.x, pos.y));

    vec3 color = vec3(0.0);

    color.r += 20.0 * sin(len * a1 + angle * 40.0 + u_time) + 
        0.5 * cos(a1 * u_time * 0.01);
    color.g += 15.0 * sin(len * a2 + angle * 40.0 - u_time) + 
        0.5 * cos(a1 * u_time * 0.01);
    color.b += 20.0 * sin(len * a3 + angle * 50.0 + 3.0);

    return color;
}

/*
 * Creates horizontal scan lines
 */
float scanLines(vec2 coord, float size)
{
    float alpha = sin(floor(coord.x * size) + u_time * 4.0) + 0.5;
    return alpha;
}

/*
 * Creates "light" that moves from left to right
 */
vec3 movingLight(vec2 coord)
{
    coord.x += sin(u_time) + cos(2.1 * u_time);
    float fcolor = 0.0;
    fcolor += 0.1 * (abs(sin(u_time)) + 0.1) / length(coord);
    return vec3(fcolor);
}

/*
 * Creates a circle of light with n lighs sources and radius
 */
vec3 lightCircle(vec2 coord, float radius, int n)
{
    vec3 color = vec3(0.);
    for (int i = 0; i < 5; i++)
    {
        float rad = radians(360. / float(n)) * float(i);
        color += 0.008 / length(coord + vec2(radius * cos(rad), radius * sin(rad)));    
    }
    return color;
}

/*
 * Creates a grid of boxes
 */
vec3 boxGrid(vec3 color, float a1, float a2)
{
    vec2 coord = 2.0 * gl_FragCoord.xy - u_resolution;
    color += abs(cos(coord.x / a1) + sin(coord.y / a2) - cos(u_time));
    return color;
}

/*
 * Creates a morphing grid
 */
vec3 morphGrid(vec2 coord, float zoom, float a1, float a2, float a3)
{
    coord = izoom(coord, zoom);

    coord -= u_time + vec2(sin(coord.y), cos(coord.x));

    float rand01 = fract(random2d(floor(coord)) + u_time / a1);
    float rand02 = fract(random2d(floor(coord)) + u_time / a2);
    float rand03 = fract(random2d(floor(coord)) + u_time / a3);

    rand01 *= 4.0 * (0.4 - length(fract(coord)));
    rand02 *= 4.0 * rand01;
    rand03 *= 4.0 * rand02;

    return vec3(rand01, rand02, rand03);
}

vec3 circleColor(vec2 coord, float zoom)
{
    vec3 color = vec3(0.0);
    coord = izoom(coord, zoom);
    color.r += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time / 12.0)));
    color.g += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time / 4.0)));
    color.b += abs(0.1 + length(coord) - 0.6 * abs(sin(u_time /9.0)));
    color = 0.1 / color;
    return color;
}

void main()
{
    // gl_FragCoord Coordnate system of the frag shader
    // Normalize position to be between 0-1
    vec2 _coord = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x); 
    
    // translate coords
    vec2 coord = translate(_coord, vec2(0.0));
    //vec2 coord = translate(_coord, vec2(0.5* sin(u_time/2.), 0.5*cos(u_time)));
    //vec2 coord = gl_FragCoord.xy / u_resolution.xy;

    // scale
    // coord = scale(coord, vec2(sin(u_time)));

    // rotate
    // coord = rotate(coord, 0.);

    // shapes
    float circle = circleShape(coord, 0.2);
    float rectangle = rectShape(coord, vec4(0.2, 0.2, 0.8, 0.8));
    float polygon = polygonShape(coord, 0.6, 6.0);

    //vec3 color = rectangle * vec3(0.2, 0.9, 0.2);
    vec3 color = vec3(0.0);
    
    //color = warpGrid(coord, color);
    color = waterColor(coord, color, 3, vec2(0.8, 1.0), vec3(0.5, 0.5, 1.0));
    //color = waterColor2(coord, color, 6, vec3(.1, 2.0, 1.0));
    
    // warp lines
    //color = warpVerticalLines(coord, 50.0, 30.0, 20.0, 10.0);
    //color = warpHorizontalLines(coord, 50.0, 50.0, 10.0, 10.0);
    
    // swirl
    // color = swirl(coord, vec2(0.0, 0.0), 50.0, 50.0, 100.0);

    // // scan lines
    // color = vec3(1.0);
    // float alpha = scanLines(coord, 6.0);

    // moving light
    // color = vec3(1.0);
    // color = movingLight(coord);

    // circle of lights
    // color = lightCircle(coord, .5, 20);

    // grid of boxes
    // color = boxGrid(color, 20.0, 20.0);

    // morph grid
    // color = morphGrid(coord, 10.0, 15.0, 10.0, 10.0);

    // circle color pulse
    //color = circleColor(coord, .8);
    
    // images
    //coord = (gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x); 
    //coord.x += 0.;

    // vec4 image = texture2D(u_tex0, coord);

    // circle with image
    //coord = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x); 
    //image.rgb += circleColor(coord + vec2(0.03, -0.4), .4);

    //color = image.rgb;

    gl_FragColor = vec4(color, 1.0);
}
