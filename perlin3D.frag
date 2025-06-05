#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float rand1df(float v)
{
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float rand1dv3s(vec3 co, vec3 seed)
{
    return fract(sin(dot(co, seed)) * 43758.5453);
}

float rand1dv3(vec3 co)
{
    return rand1dv3s(co, vec3(12.9898, 78.233, 48.4867));
}


vec3 rand3d(vec3 value)
{
    float u = rand1dv3(value);
    float v = rand1dv3(value + 1.0);

    float theta = 6.28318530718 * u;
    float phi = acos(1.0 - 2.0 * v);

    return vec3(
        sin(phi) * cos(theta),
        sin(phi) * sin(theta),
        cos(phi)
    );
}

vec3 fade(vec3 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float calc_dot(vec3 coord, vec3 dir)
{
    vec3 grid = floor(coord);
    vec3 gradient = rand3d(grid + dir);
    vec3 d = fract(coord) - dir;
    return dot(d, gradient);
}

float perlin(vec3 uv, float grid_size)
{
    vec3 coord = uv * grid_size;

    float bottom_left_0 = calc_dot(coord, vec3(0, 0, 0));
    float top_left_0 = calc_dot(coord, vec3(1, 0, 0));
    float top_right_0 = calc_dot(coord, vec3(1, 1, 0));
    float bottom_right_0 = calc_dot(coord, vec3(0, 1, 0));

    float bottom_left_1 = calc_dot(coord, vec3(0, 0, 1));
    float top_left_1 = calc_dot(coord, vec3(1, 0, 1));
    float top_right_1 = calc_dot(coord, vec3(1, 1, 1));
    float bottom_right_1 = calc_dot(coord, vec3(0, 1, 1));

    vec3 f = fade(fract(coord));
    float p0 = mix(
        mix(bottom_left_0, top_left_0, f.x),
        mix(bottom_right_0, top_right_0, f.x),
        f.y
    );

    float p1 = mix(
        mix(bottom_left_1, top_left_1, f.x),
        mix(bottom_right_1, top_right_1, f.x),
        f.y
    );
    return mix(p0, p1, f.z);
}

void main()
{
    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x);
    float grid_size = 10.0;
    float v = perlin(vec3(uv, u_time * 0.1), grid_size);
    v = smoothstep(0.4, 0.5, v * 0.5 + 0.5);
    gl_FragColor = vec4(vec3(v), 1);
}
