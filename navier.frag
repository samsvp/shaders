#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;


/*
 * Returns wheter p1 is close to p2
 */
bool close(float p1, float p2, float eps)
{
    return p1 < p2 + eps && p1 > p2 - eps;
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


void main()
{
    // screen coordinates
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    // color
    vec3 color;

    // mouse position
    vec2 m = (2.0 * u_mouse.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);
        
    float r = 0.5;
    vec3 c = circle(r, coord - m, 0.01, vec2(0));
    

    gl_FragColor = vec4(color + c, 1.0);
}