#ifdef GL_ES
precision mediump float;
#endif

// uniforms
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;



float draw_line(vec2 uv, float low_thresh, 
        vec2 mult1, vec2 mult2)
{
    float high_thresh = low_thresh + 0.001;
    return 1. - smoothstep(low_thresh - 0.01, high_thresh - 0.01, 
        length(mult1 * uv)) +
            smoothstep(low_thresh + 0.01, high_thresh + 0.01, 
        length(mult2 * uv));
}


float draw_line(vec2 uv, float low_thresh, vec2 mult1)
{
    return draw_line(uv, low_thresh, mult1, mult1);   
}


float draw_line(vec2 uv, float low_thresh)
{
    return draw_line(uv, low_thresh, vec2(1.0), vec2(1.0));   
}


/*
 * Draws a head
 */
float draw_head(vec2 coord, vec2 offset)
{
    vec2 p = coord - offset;
    
    float low_thresh = 0.001 * (1.0 + sin(
        // create a little stroke variation
        2. * atan(p.y, p.x) + 1.5
    ));
    float high_thresh = low_thresh + 0.001;

    if (coord.y > 0.55) return 1.0;

    return smoothstep(low_thresh, high_thresh, 
        length(0.05 - dot(vec2(1.5, 0.7) * p, p)));
}


/*
 * Draws closed eye-like shapes
 */
float draw_closed_eye(vec2 coord, vec2 offset)
{
    vec2 p = coord - offset;
    float low_thresh = coord.y * coord.y * (1.0 + .01 * sin(
        // give the eye an eyelid like effect
        110.0 * atan(p.y, p.x)
    ));
    return draw_line(p, low_thresh,
        vec2(1., 1.2), vec2(2.0, 1.2));  
}


float draw_mouth(vec2 coord)
{
    vec2 p = coord - vec2(0.5, 0.4);
    float low_thresh = coord.y * coord.y * (1.0 + .01 * sin(
        // creates the lower mouth look
        20.0 * atan(p.y, p.x) + 5.0
    ));

    float lower_mouth = draw_line(p, low_thresh,
        vec2(1.5, 1.2), vec2(2.0, 1.2));

    p = coord - vec2(0.5, 0.42);
    low_thresh = coord.y * coord.y * (1.0 + .001 * sin(
        // draws a line for the upper mouth
        1.0 * atan(p.y, p.x) + 5.0
    ));

    float mouth = lower_mouth * draw_line(p, low_thresh,
        vec2(1., 1.2), vec2(1.5, 1.2));

    return mouth;
}


// we will draw using only the shader
void main()
{
    // coords are from 0 to 1
    vec2 coord = gl_FragCoord.xy / 
        u_resolution.xy;

    // make background
    vec3 color = vec3(1);


    float head = draw_head(coord, vec2(0.5, 0.5));

    float h = 0.64;
    float left_eye = draw_closed_eye(coord, vec2(0.4, h));
    float right_eye = draw_closed_eye(coord, vec2(0.6, h));
    float mouth = draw_mouth(coord);
    
    color *= head * left_eye * right_eye * mouth;
    

    gl_FragColor = vec4(color, 1.0);
}