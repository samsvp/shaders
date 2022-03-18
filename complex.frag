#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.1415926535;
const float INF = 1000000.;
const float sqrt2over2 = 0.707106781187;
const float c = 0.2;

uniform float u_time;
uniform vec2 u_resolution;



vec2 conjugate(vec2 z)
{
    return vec2(z.x, -z.y);
}


vec2 complex_mult(vec2 z1, vec2 z2)
{
    return vec2(
        z1.x*z2.x-z1.y*z2.y,
        z1.x*z2.y+z1.y*z2.x
    );
}


/*
 * folds the plane
 */
vec3 fold(float w, vec2 coord, vec3 color)
{
    color = max(abs(coord.x), abs(coord.y)) <= w ? 
        color + c : vec3(0) ;

    return color;
}


/*
 * half folds a portion of the plane
 */
vec3 half_fold(float w, float s, 
        vec2 coord, vec3 color)
{
    coord -= vec2((1.5*s) - 1.0, 0.0);
    if (abs(coord.x) <= s * w && 
            abs(coord.y) <= w)
        color += c;
    else if (abs(coord.x - s) <= s * w && 
            abs(coord.y) <= w)
        color -= c;
    
    return color;
}


/*
 * full folds a portion of the plane
 */
vec3 full_fold(float w, float s, 
        vec2 coord, vec3 color)
{
    coord -= vec2((1.5*s) - 1.0, 0.0);
    if (abs(coord.x) <= s * w && 
            abs(coord.y) <= w)
        color += c;
    else if (abs(coord.x - s) <= s * w && 
            abs(coord.y) <= w)
        color = vec3(0);
    
    return color;
}



/*
 * unfolds the plane
 */
vec3 unfold(float w, vec2 coord, vec3 color)
{
    color = max(abs(coord.x), abs(coord.y)) <= w ?
        color + vec3(c) : color - vec3(0);

    return color;
}




void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    vec3 color = vec3(0.);

    color = fold(0.5, coord, color);
    
    coord = vec2(2.0, 1.0) * coord - vec2(0.5, 0);
    color = fold(0.5, coord, color);
    color = color.x <= 0.0 ? vec3(-INF) : color;
    color = coord.x < coord.y ? color + c : color - c;

    // coord = vec2(1.0, 2.0) * coord;
    color = half_fold(0.5, .5, coord, color);


    gl_FragColor = vec4(color, 1.0);
}