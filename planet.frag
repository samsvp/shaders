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


void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);
    vec3 color = vec3(0.0);


    float curve = 0.05 * sin((1.25 * coord.x) + (1.0 * u_time));

    vec3 P1ColorIn = vec3(1.0, 0.5, 0.0);
    vec3 P1ColorOut = vec3(1.0, 0.0, 0.0);

    for (float i=-0.5; i<0.7; i+=0.2)
    {
        float lineAShape = smoothstep(
            1.0 - clamp(distance(curve + coord.y, i) * .25, 0.0, 1.0), 
        1.0, 0.99);
        color += (1.0 - lineAShape) * vec3(mix(P1ColorIn, P1ColorOut, lineAShape));
    }
    

    vec2 n_coord = coord;
    n_coord.x += 0.1 * u_time;
    n_coord.y += 0.02 * sin(1.1 * u_time);

    color.g += sin(n_coord.y * 20.0) / (distance(vec2(0.0), coord) + 0.25) +
        (0.1 * cos(u_time) + 0.2) * sin(n_coord.x * 20.0);
    

    gl_FragColor = vec4(color, 1.0);
}