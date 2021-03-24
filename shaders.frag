#ifdef GL_ES
precision mediump float;
#endif


const float PI = 3.1415926535;

uniform vec2 u_resolution;

float circleShape(vec2 position, float radius)
{
    // step function
    // returns 0 for points inside circle
    // returns 1 otherwise
    return 1. - step(radius, length(position - vec2(0.5))); 
}

float rectShape(vec2 position, vec4 sides)
{
    // sides: x1, y1, x2, y2
    vec2 hv = step(sides.xy, position) * step(position, sides.zw);
    return hv.x * hv.y;
}

float polygonShape(vec2 position, float radius, float sides)
{
    position = position * 2.0 - 1.0; // centers the polygon
    float angle = atan(position.x, position.y);
    float polyAngles = PI * 2.0 / sides; // gets the radians of every slice
    // floor(0.5 + angle / polyAngles) * polyAngles - angle
    // rounds the angles so the sides are flat
    // cos(.) * length(position) 
    // distance from center aleg angle
    return step(radius, cos(floor(0.5 + angle / polyAngles) * polyAngles - angle) * length(position));
}

void main()
{
    // gl_FragCoord Coordnate system of the frag shader
    // Normalize position to be between 0-1
    vec2 position = gl_FragCoord.xy / u_resolution; 
    
    // shapes
    float circle = circleShape(position, 0.2);
    float rectangle = rectShape(position, vec4(0.2, 0.2, 0.8, 0.8));
    float polygon = polygonShape(position, 0.6, 6.0);

    vec3 color = rectangle * vec3(0.2, 0.9, 0.2);
    gl_FragColor = vec4(color, 1.0); // output
}
