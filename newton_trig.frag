#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

#define PI 3.1415926535


/* Complex multiplication */
vec2 cmul(vec2 z1, vec2 z2)
{
    return vec2(
        z1.x * z2.x - z1.y * z2.y,
        z1.x * z2.y + z1.y * z2.x
    );
}


/* Complex division */
vec2 cdiv(vec2 z1, vec2 z2)
{
    float d = z2.x * z2.x + z2.y * z2.y;
    return vec2(
        z1.x * z2.x + z1.y * z2.y,
        z1.y * z2.x - z1.x * z2.y
    ) / d;
}


/* Complex exponential */
vec2 cexp(vec2 z)
{
    float exp_x = exp(z.x);
    return exp_x * vec2(cos(z.y), sin(z.y));
}


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


vec2 sinh(vec2 z)
{
    return (cexp(z) - cexp(-z)) / 2.0;
}


vec2 cosh(vec2 z)
{
    return (cexp(-z) + cexp(z)) / 2.0;
}


vec2 tanh(vec2 z)
{
    vec2 x1 = cexp(z);
    vec2 x2 = cexp(-z);

    return cdiv(x1 - x2, x1 + x2);
}


vec2 f(vec2 z)
{
	return tanh(z);// - vec2(1.0, 0.0);
}



vec2 df(vec2 z)
{
	return cdiv(vec2(1.0, 0.0), cmul(cosh(z), cosh(z)));
}



// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


vec3 newton_method(vec2 z)
{

    // newton method
    float tol = 0.01;
    for (int i=0; i<100; i++)
    {
        z -= cmul(vec2(0.5, 0.5), cdiv(f(z), df(z)));

        vec2 diff = f(z);//z - roots[j];
        if (abs(diff.x) < tol && abs(diff.y) < tol)
        {
            float m = mod(z.x, 2.0 * PI);
            float phase = m / 10.0;//(atan(z.y, z.x) + PI) / (2.0 * PI);
            return hsv2rgb(vec3(phase, 1.0, 1.0));
        }
        
    }

    return vec3(0);
}


void main()
{
    
    vec2 _coord = (2.0 * gl_FragCoord.xy - u_resolution) 
        / min(u_resolution.y, u_resolution.x); 

    // translate coords
    vec2 coord = translate(_coord, vec2(0.0, -18.5));
    coord = izoom(coord, 2.5);
    
    vec3 color = newton_method(coord);

    gl_FragColor = vec4(color, 1.0);
}