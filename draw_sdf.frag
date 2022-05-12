// https://michaelwalczyk.com/blog-ray-marching.html
#ifdef GL_ES
precision mediump float;
#endif


// uniforms
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;


void main()
{
    // coords are from -1 to 1
    vec2 coord = 2.0 * gl_FragCoord.xy / 
        u_resolution.xy - 1.0;
    
    vec3 color = vec3(1.);

    // computes the distance between the coord
    // and the point p.
    // results in a gradient black circle
    vec2 p = vec2(0., 0.);
    vec2 p_distance = coord - p;

    float leaves = 10.0;

    float low_thresh = 0.2 + 
    0.02 * (0.5 * cos(u_time) + 1.5) * sin(
        // the atan returns the angle of our pixel
        // from the circle
        atan(
            p_distance.y, p_distance.x
        ) * leaves + 15.
    );

    float high_thresh = low_thresh + 0.005;


    if (coord.y > 0.)
    {
        color *= smoothstep(
            low_thresh, high_thresh, 
                dot(vec2(5., 10.0/u_time) * p_distance, p_distance)
        );

        gl_FragColor = vec4(color, 1.0);
    }
    else
    {
        
        color *= smoothstep(
            low_thresh, high_thresh, dot(
                vec2(5., max(50.0/u_time, 2.0)) * p_distance, p_distance)
        );
        gl_FragColor = vec4(color, 1.0);
    }
    
}