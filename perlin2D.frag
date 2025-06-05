#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float rand1df(float v)
{
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float rand1dv2s(vec2 co, vec2 seed)
{
    return fract(sin(dot(co, seed)) * 43758.5453);
}

float rand1dv2(vec2 co)
{
    return rand1dv2s(co, vec2(12.9898, 78.233));
}

vec2 rand2d(vec2 value)
{
    float angle = rand1dv2(value) * 6.28319;
    return vec2(cos(angle), sin(angle));
}

vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float calc_dot(vec2 coord, vec2 dir)
{
    vec2 grid = floor(coord);
    vec2 gradient = rand2d(grid + dir);
    vec2 d = fract(coord) - dir;
    return dot(d, gradient);
}

float perlin(vec2 uv, float grid_size)
{
    vec2 coord = uv * grid_size;

    float bottom_left = calc_dot(coord, vec2(0, 0));
    float top_left = calc_dot(coord, vec2(1, 0));
    float top_right = calc_dot(coord, vec2(1, 1));
    float bottom_right = calc_dot(coord, vec2(0, 1));

    vec2 f = fade(fract(coord));
    return mix(
	mix(bottom_left, top_left, f.x),
	mix(bottom_right, top_right, f.x),
	f.y
    );
}

void main()
{
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x);
    float grid_size = 1.0;
    float v = perlin(uv, grid_size);
    v = smoothstep(0.4, 0.5, v * 0.5 + 0.5);
    gl_FragColor = vec4(vec3(v), 1);
}
