// https://www.youtube.com/watch?v=0ifChJ0nJfM&ab_channel=InigoQuilez
#ifdef GL_ES
precision mediump float;
#endif

// uniforms
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// we will draw using only the shader
// the srawing is a palm tree
void main()
{
    // coords are from 0 to 1
    vec2 coord = gl_FragCoord.xy / 
        u_resolution.xy;

    // make background
    vec3 color = mix(vec3(1.0, 0.4, 0.1), 
        vec3(1.0, 0.8, 0.3), sqrt(coord.y));


    // computes the distance between the coord
    // and the point p.
    // results in a gradient black circle
    vec2 p = vec2(0.35, 0.7);
    vec2 p_distance = coord - p;
    
    
    ////// the smoothstep function
    // returns 0 if distance is less than the first
    // parameter and 1 if it's bigger than the second.
    // interpolates between the 0 and 1
    // if the value is between the parameters

    ////// creating a shape
    ////// Palmtree leaves
    // the smoothstep would create a black circle.
    // here we add a sine wave to the circle to
    // create a "star"-like shape. The leaves
    // parametes determines how many sine
    // periods we have, it determines the frequency.
    // You can can think of a sine wave being added
    // to the edges of the circle
    float leaves = 10.0;
    float low_thresh = 0.2 + 
        0.1 * sin(
            // the atan returns the angle of our pixel
            // from the circle
            atan(
                p_distance.y, p_distance.x
            ) * leaves + 
            // this is the phase. By adding a constant
            // to it we can rotate the image
            // and by adding the center distance(x or y) 
            // we can morph it
            25.0 * p_distance.x + 15.
        );
    float high_thresh = low_thresh + 0.005;
    color *= smoothstep(
        low_thresh, high_thresh, length(p_distance)
    );

    ///// Palmtree trunk
    // the exponential adds a "ground"
    // to the image. By adding it to the tree
    // trunk we actually have them "linked" 
    // together
    float ground = exp(-52.*coord.y);
    // the cos part creates the ondulations
    // the first parameter is the amplitude
    // the second controls the wave patterns
    float trunk_width = 0.02 + 
        0.002 * cos(200.0 * p_distance.y) +
        ground;

    color *= 1.0 - (
        // draw the trunk in black
        1.0 - smoothstep(
        trunk_width, trunk_width+0.001, 
            (
                // the "x" part creates the black line 
                abs(p_distance.x - 
                // the "y" part bends the trunk
                0.2 * sin(2.0 * p_distance.y)
                )
                
            )
    )) * ( 
        // remove the upper part of the trunk
        // and leave only the area bellow the 
        // palmtree leaves
        1.0 - smoothstep(0.0, 0.0, p_distance.y)
    );

    gl_FragColor = vec4(color, 1.0);
}