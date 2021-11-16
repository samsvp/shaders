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


vec3 spiral(vec2 coord)
{
    vec3 color = vec3(0.0);

    vec2 spherical_coord = vec2(length(coord + vec2(-0.5, 0.0)), atan(coord.y, coord.x));

    spherical_coord += min(abs(0.1 * sin(0.1 * u_time)), 0.05 + 0.05*cos(0.1 * u_time));

    color.r += 1.0 - smoothstep(
        .9 + spherical_coord.x - .1 * spherical_coord.y, 1.0, 0.99
    );

    return 0.1 * color;
}


vec3 checker(vec2 coord, float size)
{
    coord += vec2(2.0, 0.0);
    
    float tile = max((size * coord.x) + 
        (size * coord.y), 1.0);
    vec3 col = vec3(
            0.02 * abs(sin(.25 * tile * u_time))
        );
    return col;
}


/*
 * Creates a storm looking thing
 */
float storm(vec2 coord)
{
    vec2 n_coord = coord;
    n_coord.x += 0.1 * u_time;
    n_coord.y += 0.02 * sin(1.1 * u_time);

    float col = sin(n_coord.y * 20.0) / (distance(vec2(0.2), coord) + 0.25) +
        (0.1 * cos(u_time) + 0.2) * sin(n_coord.x * 20.0);

    return col;
}


/*
 * Creates another storm looking thing
 */
float pseudo_storm(vec2 coord, float size)
{
    coord += vec2(
        0.2 * abs( sin(0.1 * u_time)) + 
            0.15 * abs(cos(0.2 * u_time)), 
        0.0);

    float col = 0.2*(
        sin(coord.y * 18.0) / (distance(vec2(0.), coord) + 0.2) +
        (0.02 * cos(u_time) + 0.2) * sin(coord.x * 18.0)
    );
    return col;
}


void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    vec3 color = vec3(0.0);

    float curve = 0.05 * 
        sin((1.25 * coord.x) + (1.0 * u_time));

    vec3 color1 = vec3(1.0, 0.5, 0.0);
    vec3 color2 = vec3(1.0, 0.0, 0.0);

    for (float i=-0.5; i<0.7; i+=0.2)
    {
        float line = smoothstep(
            1.0 - clamp(
                distance(curve + coord.y, i) * .25, 
                0.0, 1.0), 1.0, 0.99);
        color += (1.0 - line) * 
            vec3(mix(color1, color2, line));
    }
    

    color.g += storm(coord);

    float lighting = 1.0 - length(coord + vec2(0.4,0.0));
    color *= 0.8 * lighting;

    //color += spiral(coord);
    
    color -= checker(coord / u_time, 10.);
    color.g -= pseudo_storm(coord, 2.);

    gl_FragColor = vec4(color, 1.0);
}