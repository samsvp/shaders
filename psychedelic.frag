#ifdef GL_ES
precision mediump float;
#endif


const float PI = 3.1415926535;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

uniform sampler2D u_tex0; //reserva.jpeg


void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) /
         min(u_resolution.y, u_resolution.x); 
    vec3 color = vec3(0.0);
    
    vec4 image = texture2D(u_tex0, 0.5 * (coord + vec2(1.0)));

    color = image.rgb;
    // color.r *= 0.2 * sin(2.0 * u_time) + 0.2 + 0.2 * sin(0.5 * u_time);
    // color.g *= 0.2 * cos(PI * u_time) + 0.4 + 0.1 * sin(0.5 * u_time);
    // color.b *= 0.2 * sin(1.0 * u_time) + 0.3;

    color.r += -abs(0. - 0.3 * abs(sin(u_time / 2.0))) - 0.3;
    color.g += -abs(0. - 0.3 * abs(sin(u_time / 2.0))) - 0.3;
    color.b += -abs(0. - 0.3 * abs(sin(u_time /2.0))) - 0.3;
    color = 0.5 / color - 0.2;

    gl_FragColor = vec4(color, 1.0);
}