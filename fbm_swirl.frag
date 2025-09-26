#ifdef GL_ES
precision highp float;
#endif

#define PI 3.14159

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

vec3 HUEtoRGB(float H)
{
    float R = abs(H * 6.0 - 3.0) - 1.0;
    float G = 2.0 - abs(H * 6.0 - 2.0);
    float B = 2.0 - abs(H * 6.0 - 4.0);
    return clamp(vec3(R,G,B), 0, 1);
}

vec3 HSLtoRGB(vec3 HSL)
{
    vec3 RGB = HUEtoRGB(HSL.x);
    float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
    return (RGB - 0.5) * C + HSL.z;
}

vec3 RGBtoHCV(vec3 RGB, float epsilon)
{
    // Based on work by Sam Hocevar and Emil Persson
    vec4 P = (RGB.g < RGB.b) ? vec4(RGB.bg, -1.0, 2.0/3.0) : vec4(RGB.gb, 0.0, -1.0/3.0);
    vec4 Q = (RGB.r < P.x) ? vec4(P.xyw, RGB.r) : vec4(RGB.r, P.yzx);
    float C = Q.x - min(Q.w, Q.y);
    float H = abs((Q.w - Q.y) / (6.0 * C + epsilon) + Q.z);
    return vec3(H, C, Q.x);
}

vec3 RGBtoHSL(vec3 RGB)
{
    float epsilon = 1e-10;
    vec3 HCV = RGBtoHCV(RGB, epsilon);
    float L = HCV.z - HCV.y * 0.5;
    float S = HCV.y / (1.0 - abs(L * 2.0 - 1.0) + epsilon);
    return vec3(HCV.x, S, L);
}

vec3 palette[8];
int palette_size;

int index_matrix4x4[16];

float index_value()
{
    int x = int(mod(gl_FragCoord.x, 4.0));
    int y = int(mod(gl_FragCoord.y, 4.0));
    return float(index_matrix4x4[(x + y * 4)]) / 16.0;
}

float hue_distance(float h1, float h2)
{
    float diff = abs((h1 - h2));
    return min(abs((1.0 - diff)), diff);
}

float hsl_distance(vec3 v1, vec3 v2)
{
    float d = length(v1.yz - v2.yz);
    return d + hue_distance(v1.x, v2.x);
}

void closest_colors(vec3 hsl, out vec3 closest, out vec3 second_closest)
{
    closest = vec3(-2, 0, 0);
    second_closest = vec3(-2, 0, 0);
    vec3 temp;
    for (int i = 0; i < palette_size; ++i) {
        temp = palette[i];
        float temp_distance = hsl_distance(temp, hsl);
        if (temp_distance < hsl_distance(closest, hsl)) {
            second_closest = closest;
            closest = temp;
        } else if (temp_distance < hsl_distance(second_closest, hsl)) {
            second_closest = temp;
        }
    }
}

vec3 dither(vec3 color)
{
    vec3 hsl = RGBtoHSL(color);
    vec3 closest_color = vec3(0.0);
    vec3 second_closest_color = vec3(0.0);
    closest_colors(hsl, closest_color, second_closest_color);
    float d = index_value();
    float hueDiff = hsl_distance(hsl, closest_color) /
                    hsl_distance(second_closest_color, closest_color);
    return HSLtoRGB(hueDiff < d ? closest_color : second_closest_color);
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

float fbm(vec3 uv, float freq)
{
    float A = 1.0;
    float sum = 0.0;

    for (int i = 0; i < 2; i++)
    {
        sum += A * perlin(uv, freq);
        freq *= 2.0;
        A /= 2.0;
    }

    return sum;
}

vec2 rotate(float theta, vec2 coord)
{
    mat2 R = mat2(cos(theta), -sin(theta),
                  sin(theta), cos(theta));

    return coord * R;
}

void main()
{
    index_matrix4x4[0] = 0;
    index_matrix4x4[1] = 8;
    index_matrix4x4[2] = 2;
    index_matrix4x4[3] = 10;
    index_matrix4x4[4] = 12;
    index_matrix4x4[5] = 4;
    index_matrix4x4[6] = 14;
    index_matrix4x4[7] = 6;
    index_matrix4x4[8] = 3;
    index_matrix4x4[9] = 11;
    index_matrix4x4[10] = 1;
    index_matrix4x4[11] = 9;
    index_matrix4x4[12] = 15;
    index_matrix4x4[13] = 7;
    index_matrix4x4[14] = 13;
    index_matrix4x4[15] = 5;

    palette_size = 4;
    palette[0] = vec3(0, 0.72, 0.45);
    palette[1] = vec3(0, 0.72, 0.25);
    palette[2] = vec3(0, 0.72, 0.06);
    palette[3] = vec3(0, 0.72, 0.51);

    vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.y, u_resolution.x);
    float p = 80.0;
    uv = floor(uv) +(floor(p * uv) - p * floor(uv)) / p;

    float effect_radius = 1.5;
    float effect_angle = 2. * PI;

    vec2 center = vec2(.5, .5);

    float len = .25 * length(uv);
    float angle = atan(uv.y, uv.x) + effect_angle * smoothstep(effect_radius, 0., len);
    float radius = length(uv);

    uv = vec2(radius * cos(angle), radius * sin(angle)) + center;

    uv = rotate(0.05 * u_time, uv);

    float grid_size = 4.0;
    float v = fbm(vec3(uv, u_time * 0.05), grid_size);
    v = v * 0.5 + 0.5;
    float v0 = smoothstep(0.2, 0.35, v);
    float v1 = smoothstep(0.45, 0.5, v);
    float v2 = smoothstep(0.6, 0.8, v);
    vec3 c0 = HSLtoRGB(palette[0]);
    vec3 c1 = HSLtoRGB(palette[1]);
    vec3 c2 = HSLtoRGB(palette[2]);
    vec3 c3 = HSLtoRGB(palette[3]);
    vec3 color = mix(c0, c1, v0);
    color = mix(color, c2, v1);
    color = mix(color, c3, v2);
    gl_FragColor = vec4(dither(color), 1);
}
