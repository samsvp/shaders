#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.1415926535;

uniform float u_time;
uniform vec2 u_resolution;


/*
 * Returns wheter p1 is close to p2
 */
bool close(float p1, float p2, float eps)
{
    return p1 < p2 + eps && p1 > p2 - eps;
}


float deg2rad(float angle)
{
    return PI * angle / 180.0;
}


/*
 * Rotates the given coordinates by
 * theta rads. This changes the input
 * coordinates
 */
void rotate_coord(float theta, out vec2 coord)
{
    mat2 R = mat2(cos(theta), -sin(theta),
                  sin(theta), cos(theta));

    coord *= R;
}


/*
 * Scales the given coordinates by s.
 * This changes the input coordinates
 */
void scale_coord(float s, out vec2 coord)
{
    coord /= s;
}


/*
 * Rotates the given coordinates by
 * theta rads
 */
vec2 rotate(float theta, vec2 coord)
{
    mat2 R = mat2(cos(theta), -sin(theta),
                  sin(theta), cos(theta));

    return coord * R;
}


/*
 * Scales the given coordinates by s
 */
vec2 scale(float s, vec2 coord)
{
    return coord / s;
}


/*
 * Draws a rectangle on screen
 */
vec3 rect(float w, float h, vec2 coord, 
    float thickness, vec2 offset)
{
    vec3 color = vec3(0.0);

    coord += offset;

    float lx = abs(coord.x);
    float ly = abs(coord.y);

    if (lx <= w && ly < h + thickness ||
        ly <= h && lx < w)
    {
        color = vec3(1.0);
    }

    return color;
}

vec3 rect(float w, vec2 coord, float thickness)
{
    return rect(w, w, coord, thickness, vec2(0.0));
}

vec3 rect(float w, float h, vec2 coord, float thickness)
{
    return rect(w, h, coord, thickness, vec2(0.0));
}

vec3 rect(float w, vec2 coord, float thickness, vec2 offset)
{
    return rect(w, w, coord, thickness, offset);
}



void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    vec3 color = vec3(0.1);

    float thickness = 0.005;

    coord += vec2(0., -0.5);

    color.g += rect(0.5, coord, thickness).x;


    vec2 t_coord = coord - vec2(fract(u_time), -mod(floor(u_time) * 0.5, 1.5));
    color.r += rect(0.2, t_coord, 
        thickness, vec2(0.5, -0.5)).x;
    

    if (mod(floor(u_time) * 0.5, 1.5)>0.25)
        color.xy += rect(0.5, 0.15, coord - vec2(0., -.85), thickness).xy;
    else if (coord.x > -0.5 && coord.y < -0.7 && coord.y > -1. && coord.x < 0.5)
        color.xy += rect(fract(u_time), (floor(u_time) * 0.5, 1.5), coord - vec2(-0.25, -1.25), thickness).xy;

    if (mod(floor(u_time) * 0.5, 1.5)>0.5)
        color.xy += rect(0.5, 0.3, coord - vec2(0., -1.1), thickness).xy;

    else if (mod(floor(u_time) * 0.5, 1.5)>0.25 &&
            coord.x > -0.5 && coord.y < -1. && coord.y > -1.5 && coord.x < 0.5)
        color.xy += rect(fract(u_time), 0.3, coord - vec2(-0.25, -1.1), thickness).xy;


    if (mod(floor(u_time) * 0.5, 1.5)>0.5 &&
            coord.x > -0.5 && coord.y < -1.25 && coord.y > -2. && coord.x < 0.5)
        color.xy += rect(fract(u_time), 0.3, coord - vec2(-0.25, -1.5), thickness).xy;

    color.b = 0.1;
    

    gl_FragColor = vec4(color, 1.0);
}