float arg(vec2 z)
{
    return atan(z.y, z.x);
}


float phase(vec2 z)
{
    return atan(z.y, z.x);
}


float magnitude(vec2 z)
{
    return length(z);
}


/**
 * Basic arithmetic
 */


vec2 cmul(float x, vec2 z)
{
    return vec2( z.x * x, x * z.y );
}


vec2 cmul(vec2 z, float x)
{
    return vec2( z.x * x, x * z.y );
}


vec2 cmul(vec2 z1, vec2 z2)
{
    return vec2(
        z1.x * z2.x - z1.y * z2.y , z1.x * z2.y + z1.y * z2.x
    );
}


vec2 cdiv(float x, vec2 z)
{
    float a = - phase(z);
    return x / length(z) * vec2( cos(a), sin(a) );
}


vec2 cdiv(vec2 z, float x)
{
    return z / x; 
}


vec2 cdiv(vec2 z1, vec2 z2)
{
    float a = phase(z1) - phase(z2);
    return length(z1) / length(z2) * vec2( cos(a), sin(a) );
}


/**
 * Powers, exp
 */

vec2 cexp(vec2 z)
{
    return exp(z.x) * vec2(cos(z.y), sin(z.y));
}


vec2 cpow(vec2 z, int _n)
{
    float n = float(_n);
    float a = n * phase(z);
    return pow(length(z), n) * vec2( cos(a), sin(a) );
}


vec2 cpow(vec2 z, float n)
{
    float a = n * phase(z);
    return exp(n * log(length(z))) * vec2( cos(a), sin(a) );
}


vec2 cpow(float x, vec2 z)
{
    return cexp( cmul( z, log(x) ) );
}



vec2 clog(vec2 z)
{
    return vec2( log(z.x), phase(z) );
}


/**
 * Hyperbolic functions
 */

vec2 sinh(vec2 z)
{
    return ( cexp(z) - cexp(-z) ) / 2.0;
}


vec2 cosh(vec2 z)
{
    return ( cexp(z) + cexp(-z) ) / 2.0;
}


vec2 tanh(vec2 z)
{
    vec2 e = cexp(2.0 * z);
    return cdiv ( e + vec2(1, 0), e - vec2(1, 0) );
}