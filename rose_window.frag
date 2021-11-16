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

float rand1d(float v)
{
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

/*
 * Scales the given coordinates by s
 */
vec2 scale(float s, vec2 coord)
{
    return coord / s;
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


// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}


// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
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
 * Draws a circle on screen
 */
vec3 color_circle(float radius, vec2 coord, 
    vec3 color, float thickness, vec2 offset)
{
    coord += offset;
    float l = length(coord);

    if (close(l, radius, thickness))
    {
        color = vec3(1.0);
    }
    if (l > radius)
    {
        color = vec3(0.0);
    }

    return color;
}

vec3 color_circle(float radius, vec2 coord, 
    vec3 color, float thickness)
{
    return color_circle(radius, coord, 
        color, thickness, vec2(0.0));
}


vec3 outer_circle(float radius, vec2 coord, vec3 color)
{
    float l = length(coord);
    if (l >= radius)
    {
        color = vec3(1.0);
    }

    return color;
}


void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    vec3 color = vec3(0.1);
    float thickness = 0.005;

    //coord = rotate(u_time, coord);
    coord = scale(0.1 * sin(u_time) + 0.8, coord);

    float r = 0.8;

    vec2 offset1 = vec2(0.0,-0.8);
    float theta = deg2rad(120.0);
    vec2 offset2 = rotate(theta, offset1);
    vec2 offset3 = rotate(theta, offset2);
    
    vec3 colors[5];
    colors[0] = vec3(0.9608, 0.1882, 0.0863);
    colors[1] = vec3(0.9608, 0.9451, 0.0863);
    colors[2] = vec3(0.1882, 0.9608, 0.0863);
    colors[3] = vec3(0.0863, 0.5373, 0.9608);
    colors[4] = vec3(0.1725, 0.0863, 0.9608);

    float angles[4];
    angles[0] = deg2rad(0.);
    angles[1] = deg2rad(180.);
    angles[2] = deg2rad(54.);
    angles[3] = -angles[2];

    // select different rose window angles
    for (float j=0.; j < 4.; j++)
    {
        coord = rotate(u_time * 0.25, coord);
        vec2 offset = rotate(angles[int(j)], vec2(0.0,0.5));
        theta = deg2rad(360./5.);

        // create the rose window
        for (float i=0.0; i<5.0; i++)
        {
            color += color_circle(r, coord, 
                0.05 * colors[int(i)] * 
                abs(0.2*sin((i+1.)*u_time/(5.-i)) + 0.6),
                thickness, offset);
            offset = rotate(theta, offset);
        }
    }
    

    color = rgb2hsv(color);
    color.y = 0.6; // saturation
    color.z = 0.8; // value
    color = hsv2rgb(color);

    color = outer_circle(r, coord, color);

    color = 1. - color;

    gl_FragColor = vec4(color, 1.0);
}