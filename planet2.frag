#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.1415926535;

uniform float u_time;
uniform vec2 u_resolution;


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
 * Creates a storm looking thing
 */
vec3 storm(vec2 coord)
{
    vec3 color;
    vec2 n_coord = coord;
    
    color.r = sin(n_coord.y * 2.0) / (distance(vec2(0.2), coord) + 0.25) +
        (0.5 * cos(u_time) + 0.5) * sin(n_coord.x * 20.0);

    color.g = sin(n_coord.y * 2.0) / (distance(vec2(0.1), coord) + 0.2) +
        (0.2 * cos(u_time) + 0.2) * sin(n_coord.x * 20.0);

    color.b = cos(n_coord.y * 2.0) / (distance(vec2(0.1), coord) + 0.2) +
        (0.5 * cos(u_time) + 0.1) * cos(n_coord.x * 20.0);

    return color;
}



void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    coord = rotate(u_time, coord);
    coord = vec2(length(coord), atan(coord.y, coord.x));
    //coord = vec2(length(coord), coord.x));

    vec3 color;

    coord += vec2(u_time * 0.5, 0.0);

    color += storm(coord);

    color = rgb2hsv(color);
    color.y = 0.7; // saturation
    //color.z = 0.6; // value
    color = hsv2rgb(color);

    gl_FragColor = vec4(color, 1.0);
}