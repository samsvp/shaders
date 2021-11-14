#ifdef GL_ES
precision mediump float;
#endif


const float PI = 3.1415926535;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform sampler2D u_tex0; //reserva.jpeg

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

vec3 checker(vec2 coord, float size)
{
    coord += 0.0;
    
    vec2 tile = vec2(floor(size * coord.x), 
        floor(size * coord.y));
    vec3 col = vec3(
            sin(2.5 * tile.x * u_time),
            sin(3.0 * tile.y * u_time) * cos(u_time),
            sin(1.8 * tile.x * tile.y * u_time)
        );
    return col;
}

void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) /
         min(u_resolution.y, u_resolution.x); 
    vec3 color = vec3(0.0);
    
    coord = scale(max(abs(sin(0.5 * u_time)), 0.2), coord);
    coord = -rotate(PI * sin(0.5 * u_time), coord);
    vec4 image = texture2D(u_tex0, 0.5 * (coord + vec2(1.0)));


    color = image.rgb;
    color += checker(coord + 1.0, .5);
    // color += vec3(
    //     checker(coord.x + 1.0, coord.y + 1.0, 5.0 * .1),
    //     checker(coord.x + 1.0, coord.y + 1.0, 3.0 * .1),
    //     checker(coord.x + 1.0, coord.y + 1.0, 4.0 * .1));

    //color = 0.5 / color - 0.2;

    gl_FragColor = vec4(color, 1.0);
}