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
 * Draws a line between two points
 */
vec3 line(vec2 p1, vec2 p2, vec2 coord, float thickness)
{
    vec3 color = vec3(0.0);

    if (!close(p1.x, p2.x, thickness))
    {
        float a = (p1.y - p2.y) / (p1.x - p2.x);
        float b = p1.y - a * p1.x;

        if (coord.x > min(p1.x, p2.x) && coord.x < max(p1.x, p2.x) &&
            close(coord.y, a * coord.x + b, thickness))
        {
            color = vec3(1.0);
        }
    }
    else 
    {
        if (coord.y > min(p1.y, p2.y) && coord.y < max(p1.y, p2.y) &&
            close(coord.x, p1.x, thickness))
        {
            color = vec3(1.0);
        }
    }

    return color;
}


/*
 * Draws a circle on screen
 */
vec3 circle(float radius, vec2 coord, 
    float thickness, vec2 offset)
{
    vec3 color = vec3(0.0);
    coord += offset;
    float l = length(coord);

    if (close(l, radius, thickness))
    {
        color = vec3(1.0);
    }

    return color;
}

vec3 circle(float radius, vec2 coord, float thickness)
{
    return circle(radius, coord, thickness, vec2(0.0));
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

    if ((close(lx, w, thickness) && ly < h + thickness) ||
        (close(ly, h, thickness) && lx < w))
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


/*
 * Draws a diamond on screen
 */
vec3 diamond(float r, vec2 coord, 
    float thickness, vec2 offset)
{
    coord = rotate(PI/4.0, coord);
    return rect(r, r, coord, thickness, offset);
}

vec3 diamond(float r, vec2 coord, float thickness)
{
    return diamond(r, coord, thickness, vec2(0.0));
}


vec3 polygon(int n_sides, float l, vec2 coord, 
    float thickness, vec2 offset)
{
    const int MAX_SIDES = 100;
    vec3 color = vec3(0.0);

    vec2 p1 = vec2(0.0, l);
    float angle = deg2rad(360.0 / float(n_sides));

    int n = 0;
    for (int n=0; n<MAX_SIDES; n++)
    {
        vec2 p2 = rotate(angle, p1);

        color += line(p1, p2, coord, thickness);
        p1 = p2;

        if (n >= n_sides) break;
    }

    return color;
}


vec3 polygon(int n_sides, float l, vec2 coord, float thickness)
{
    return polygon(n_sides, l, coord, thickness, vec2(0.0));
}


float solid_polygon(float radius, float n_sides, vec2 coord)
{
    coord = coord * 2.0 - 1.0; // centers the polygon
    float angle = atan(coord.x, coord.y);
    float polyAngles = PI * 2.0 / n_sides; // gets the radians of every slice
    return step(radius, 
        cos(floor(0.5 + angle / polyAngles) * polyAngles - angle) * 
            length(coord));
}


void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    vec3 color = vec3(0.1);

    float thickness = 0.005;

    coord = rotate(u_time, coord);

    color += rect(0.5, coord, thickness);
    color += circle(0.5, coord, thickness);
    color += diamond(0.5, coord, thickness);

    coord = rotate(u_time, coord);
    color += polygon(6, 0.5, coord, thickness);

    gl_FragColor = vec4(color, 1.0);
}