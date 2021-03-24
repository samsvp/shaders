#ifdef GL_ES
precision mediump float;
#endif


const float PI = 3.1415926535;

uniform vec2 u_resolution;
uniform float u_time;

float circleShape(vec2 position, float radius)
{
    // step function
    // returns 0 for points inside circle
    // returns 1 otherwise
    return 1. - step(radius, length(position - vec2(0.5))); 
}

float rectShape(vec2 coord, vec4 sides)
{
    // sides: x1, y1, x2, y2
    vec2 hv = step(sides.xy, coord) * step(coord, sides.zw);
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

/*
 * Zooms the canvas in or out
 */
vec2 izoom(vec2 coord, float z)
{
    return coord * z;
}

/*
 * Translates the coordinates in the x and y axis
 */
vec2 translate(vec2 coord, vec2 translation)
{
    return coord + translation * 0.5;
}

/*
 * Scales the coordinates in the x and y axis
 */
vec2 scale(vec2 coord, vec2 scale)
{
    coord -= vec2(0.5);
    coord = mat2(scale.x + 2.0, 0.0, 0.0, scale.y + 2.0) * coord;
    coord += vec2(0.5);
    return coord;
}

/*
 * Rotates the coordinates in the x and y axis
 */
vec2 rotate(vec2 coord, float angle)
{
    coord -= 0.5;
    // rotation matrix
    coord = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * coord;
    coord += 0.5;
    return coord;
}

/*
 * Creates a warp grid
 */
vec3 warpGrid(vec2 coord, vec3 color)
{
    color += sin(coord.x * cos(u_time / 30.0) * 60.0) + 
        sin(coord.y * cos(u_time / 15.0) * 10.0);
    color += cos(coord.x * sin(u_time / 30.0) * 20.0) + 
        cos(coord.y * sin(u_time / 15.0) * 60.0);

    // mist effect
    //color *= sin(u_time / 10.0) * 0.5;
    
    return color;
}

/*
 * Creates a water color like pattern
 */
vec3 waterColor(vec2 coord, vec3 color, int N, vec2 c1, vec3 rgb)
{
    coord = izoom(coord, 15.0);

    for(int n = 1; n < N; n++)
    {
        float i = float(n);
        coord += vec2(c1.x + c1.y / i * sin(i * coord.y + u_time + 0.3 * i), 
            c1.x + c1.y / i * sin(coord.x + u_time + 0.3 * i));
    }
    coord += vec2(c1.x + c1.y / sin(coord.y + u_time + 0.3), 
            c1.x + c1.y / sin(coord.x + u_time + 0.3));
    color = vec3(rgb.x * sin(coord.x) + rgb.x, 
        rgb.y * sin(coord.y) + rgb.y, 
        rgb.z * sin(coord.x + coord.y));
    return color;
}

/*
 * Creates a water color like pattern
 */
vec3 waterColor(vec2 coord, vec3 color)
{
    return waterColor(coord, color, 8, vec2(0.8, 1.0), vec3(0.5, 0.5, 1.0));
}

/*
 * Creates a water color like pattern
 */
vec3 waterColor2(vec2 coord, vec3 color, int amount, vec3 rgb)
{
    coord = izoom(coord, 20.0);
    
    float len = 0.0;

    for(int i = 0; i < amount; i++){
        len = length(coord.xy);
        coord.x = coord.x - cos(coord.y + sin(len)) + cos(u_time / 5.0);
        coord.y = coord.y + sin(coord.x + cos(len)) + sin(u_time / 6.0);
    }

    return vec3(cos(len * rgb));
}  

/*
 * Creates a water color like pattern
 */
vec3 waterColor2(vec2 coord, vec3 color)
{
    return waterColor2(coord, color, 6, vec3(2.0, 3.0, 1.5));
}


void main()
{
    // gl_FragCoord Coordnate system of the frag shader
    // Normalize position to be between 0-1
    vec2 _coord = (gl_FragCoord.xy - u_resolution / 2.0) / min(u_resolution.y, u_resolution.x); 
    
    // translate coords
    vec2 coord = translate(_coord, vec2(0.0));
    //vec2 coord = translate(_coord, vec2(0.5* sin(u_time/2.), 0.5*cos(u_time)));
    
    // scale
    // coord = scale(coord, vec2(sin(u_time)));

    // rotate
    coord = rotate(coord, 0.);

    // shapes
    float circle = circleShape(coord, 0.2);
    float rectangle = rectShape(coord, vec4(0.2, 0.2, 0.8, 0.8));
    float polygon = polygonShape(coord, 0.6, 6.0);

    //vec3 color = rectangle * vec3(0.2, 0.9, 0.2);
    vec3 color = vec3(0.0);
    
    //color = warpGrid(coord, color);
    //color = waterColor(coord, color, 3, vec2(0.8, 1.0), vec3(0.5, 0.5, 1.0));
    color = waterColor2(coord, color, 6, vec3(2.0, 3.0, 1.5));

    gl_FragColor = vec4(color, 1.0); // output
}
