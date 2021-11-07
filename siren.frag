#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

/*
 * Translates the coordinates in the x and y axis
 */
vec2 translate(vec2 coord, vec2 translation)
{
    return coord + translation * 0.5;
}

void main()
{
    vec2 _coord = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x); 
    
    // translate coords
    vec2 coord = translate(_coord, vec2(0.0));
    
    vec3 color = vec3(0.0);

    vec2 pos = vec2(0.0);
    float angle = atan(-coord.y + pos.x, coord.x - pos.y) * 0.5;

    color.r += sin(u_time + angle) + cos(u_time);
    color.g += sin(u_time + angle) + cos(u_time + 5.0);
    color.b += sin(u_time + angle) + cos(u_time + 15.0);

    gl_FragColor = vec4(color, 1.0);
}