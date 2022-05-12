precision highp float;

#include "complex.glsl"

uniform float u_time;
uniform vec2 u_resolution;

/*
 * Translates the coordinates in the x and y axis
 */
vec2 translate(vec2 coord, vec2 translation)
{
    return translation * 0.5 + coord;
}


/*
 * Zooms the canvas in or out
 */
vec2 izoom(vec2 coord, float z)
{
    return coord * z;
}

vec2 f(vec2 z)
{
    return cosh(z) + vec2(4.0, 0.5);
    //return cpow(z, 6.0) + cpow(z, 3.0) + vec2(1.0);
}


vec2 df(vec2 z)
{
    float h = 0.0001;
    return (f(z+vec2(h, 0)) - f(z)) / h;
}


vec2 pdf(vec2 z)
{
    float h = 0.0001;
    return (f(z+h) - f(z))/h;
}


vec3 frac_color(float n, float a)
{
    float r = 0.5 * sin(a * n + u_time) + 0.5;
    float g = 0.5 * sin(a * n + 2.049 + u_time) + 0.5;
    float b = 0.5 * sin(a * n + 4.188 + u_time) + 0.5;

    return vec3(r, g, b);
}


void main()
{
    vec2 _coord = (2.0 * gl_FragCoord.xy - u_resolution) 
        / min(u_resolution.y, u_resolution.x); 

    // translate coords
    vec2 coord = translate(_coord, vec2(0, 0.5));
    coord = izoom(coord, 2.5);

    vec3 col = vec3(0);

    float tol = 0.001;
    vec2 z = coord;
    vec2 fz = f(z);

    float n = 0.0;
    for (int i=0; i<64; i++)
    {
        z -= cdiv(fz, df(z));
        fz = f(z);
        if (length(fz) < tol)
        {
            n = float(i);
            break;
        }
    }
    
    col = frac_color(n, 0.1);
    gl_FragColor = vec4(col, 1.0);
}