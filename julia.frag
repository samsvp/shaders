#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;


/*
 * Translates the coordinates in the x and y axis
 */
vec2 translate(vec2 coord, vec2 translation)
{
    return translation * 0.5 + coord;
}

/*
 * Zooms the canvas in or out
 */
vec2 izoom(vec2 coord, float z)
{
    return coord * z;
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

// https://en.wikipedia.org/wiki/Plotting_algorithms_for_the_Mandelbrot_set
float julia(vec2 coord, float c_real, float c_imag)
{
    float n = -1.;

    float x = coord.x;
    float y = coord.y;
    float x2 = x * x;
    float y2 = y * y;

    for (float i=0.; i < 100.; ++i)
    {
        n = i;
        y = 2. * x * y + c_imag;
        x = x2 - y2 + c_real;
        x2 = x * x;
        y2 = y * y;
        
        if (x*x + y*y >= 4.)
        {
            break;
        }
    }

    return n;
}


vec3 julia_color(float n, float a)
{
    float r = 0.5 * sin(a * n) + 0.5;
    float g = 0.5 * sin(a * n + 2.049) + 0.5;
    float b = 0.5 * sin(a * n + 4.188) + 0.5;

    return vec3(r, g, b);
}


void main()
{
    vec2 _coord = (2.0 * gl_FragCoord.xy - u_resolution) 
        / min(u_resolution.y, u_resolution.x); 

    // translate coords
    vec2 coord = translate(_coord, vec2(.0, -0.5));
    coord = izoom(coord, 1.5);

    // float c_real = -0.8;
    // float c_imag = 0.156;
    
    float c_real = 0.05 * sin(u_time) - 0.5269;
    float c_imag = 0.05 * cos(u_time) + 0.5;
    float n = julia(coord, c_real, c_imag);
    
    float a = 0.1;
    vec3 color = julia_color(n, a);

    gl_FragColor = vec4(color, 1.0);
}