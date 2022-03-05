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
    return translation * 0.5 + coord;
}


/*
 * Zooms the canvas in or out
 */
vec2 izoom(vec2 coord, float z)
{
    return coord * z;
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
 * Creates a colorful swirl shape
 */
vec3 swirl(vec2 coord, vec2 pos, float a1, float a2, float a3)
{
    float angle = atan(-coord.y + pos.x, coord.x - pos.y) * 0.5;
    float len = length(coord - vec2(pos.x, pos.y));

    vec3 color = vec3(0.0);

    color.r += 20.0 * sin(len * a1 + angle * 40.0 + u_time) + 
        0.5 * cos(a1 * u_time * 0.01) + 19.0*abs(sin(u_time));
    color.g += 15.0 * sin(len * a2 + angle * 40.0 - u_time) + 
        0.5 * cos(a1 * u_time * 0.01) + 14.0;
    color.b += 20.0 * sin(len * a3 + angle * 50.0 + 3.0) + 19.0*abs(sin(u_time));

    return color;
}


void main()
{
    vec2 _coord = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x); 
    
    // translate coords
    vec2 coord = translate(_coord, vec2(0.0));
    coord = izoom(coord, 3.0*sin(u_time  * 0.1) + 1.0);
    coord *= scale(coord, vec2(0.0));
    
    vec3 color = vec3(20.0 * sin(u_time) - 8.0, 
        15.0 * cos(u_time) - 8.0, 
        18.0 * (cos(0.5 * u_time) + sin(0.5 * u_time)) + 5.0);

    color += 1.0 - swirl(coord, vec2(0.0, 0.0), 1.0, 1.0, 1.0) + 1.0;
    
    vec3 colorhsv = rgb2hsv(color);
    color = hsv2rgb(vec3(colorhsv.x, 0.5*colorhsv.y, abs(0.4 * sin(u_time * 0.5)) + 0.2));


    gl_FragColor = vec4(color, 1.0);
}