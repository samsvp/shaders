#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.1415926535;

uniform float u_time;
uniform vec2 u_resolution;


/*
 * Generates a random number between 0 and 1
 */
float rand1d(float v)
{
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float rand1d(float v, float min_v, float max_v)
{
    return (max_v - min_v) * rand1d(v) + min_v;
}

float rand1d(vec2 coord, vec2 seed)
{
    return fract(
        sin(
            dot(coord, seed)
        ) * 43758.5453
    );
}

float rand1d(vec2 coord)
{
    return rand1d(coord, vec2(12.9898, 78.233));
}

vec2 rand2d(vec2 value)
{
	return vec2(
		rand1d(value, vec2(12.989, 78.233)),
		rand1d(value, vec2(39.346, 11.135))
	);
}

vec2 rand2d(vec2 v, float min_v, float max_v)
{
    return (max_v - min_v) * rand2d(v) + min_v;
}

/*
 * Returns wheter p1 is close to p2
 */
bool close(float p1, float p2, float eps)
{
    return p1 < p2 + eps && p1 > p2 - eps;
}


float deg2rad(float angle)
{
    return PI * angle / 180.0;
}


/*
 * Rotates the given coordinates by
 * theta rads. This changes the input
 * coordinates
 */
void rotate_coord(float theta, out vec2 coord)
{
    mat2 R = mat2(cos(theta), -sin(theta),
                  sin(theta), cos(theta));

    coord *= R;
}


/*
 * Scales the given coordinates by s.
 * This changes the input coordinates
 */
void scale_coord(float s, vec2 coord)
{
    coord /= s;
}


/*
 * Rotates the given coordinates by
 * theta rads
 */
vec2 rotate(float theta, vec2 coord)
{
    mat2 R = mat2(cos(theta), -sin(theta),
                  sin(theta), cos(theta));

    return coord * R;
}

vec2 rotate(float k, float theta, vec2 coord)
{
    mat2 R = mat2(cos(theta), -k * sin(theta),
                  sin(theta) / k, cos(theta));

    return coord * R;
}

/*
 * Scales the given coordinates by s
 */
vec2 scale(float s, vec2 coord)
{
    return coord / s;
}


/*
 * Creates a point of light
 */
vec3 light_point(vec2 point, float brightness)
{
    vec3 color = vec3(0.);

    float l = pow(length(point), 1.3);
    color += 0.00008 / l * brightness;

    return color;
}


vec3 light_point(vec2 point)
{
    return light_point(point, 5.0);
}


/*
 * Draws a line between two points
 */
vec3 line(vec2 p1, vec2 p2, vec2 coord, float thickness)
{
    vec3 color = vec3(0.0);

    if (!close(p1.x, p2.x, thickness))
    {
        float a = (p1.y - p2.y) / (p1.x - p2.x);
        float b = p1.y - a * p1.x;

        if (coord.x > min(p1.x, p2.x) && coord.x < max(p1.x, p2.x) &&
            close(coord.y, a * coord.x + b, thickness))
        {
            color = vec3(1.0);
        }
    }
    else 
    {
        if (coord.y > min(p1.y, p2.y) && coord.y < max(p1.y, p2.y) &&
            close(coord.x, p1.x, thickness))
        {
            color = vec3(1.0);
        }
    }

    return color;
}

vec3 bind_star(float x, float y, vec2 point1, out vec2 point2, 
    vec2 coord, vec3 color, float brightness, float speed, float i)
{
    point2 = vec2(
        x + rand1d(x, -0.02, 0.02),
        y + rand1d(y, -0.02, 0.02));

    float r = 0.8 * distance(point2, point1);
    //if (r >= 0.85) r = 0.85;

    // rotate the star in a ellipsoid
    point2 = r * rotate(rand1d(x, 2.0, 5.0), u_time * speed, point2) + point1;

    color += light_point(coord + point2, 0.8 * brightness);
    color += line(coord + point2, coord + point1, vec2(0,0),  0.0015);

    if (fract(i / 10.0) == 0.0)
    {
        color.r *= rand1d(0.2 * i, 3.1, 3.5);
        color.b *= rand1d(2.0 * i, 3.0, 3.5);
    }

    return color;
}


void main()
{
    vec2 coord = (2.0 * gl_FragCoord.xy - u_resolution) / 
        min(u_resolution.y, u_resolution.x);

    vec3 color = vec3(0.0);

    // generate random values to place stars in
    for (float i=1.0; i < 45.0; i++)
    {
        float value1 = rand1d(.2 * i, -1., 1.);
        float value2 = rand1d(.2 * i + rand1d(.2 * i), -1., 1.);

        vec2 point1 = vec2(value1, value2);

        vec2 n_coord = rotate(0.25 * distance(point1, vec2(0.0)) * u_time,
            coord);

        float brightness = 40.0 * (0.5 * 
            sin(.02 * PI * u_time * rand1d(value1, 1.0, 2.0)) + 0.6);

        color += light_point(n_coord + point1, brightness);

        // creates a star linked to the one we have
        if (rand1d(0.8 * i) >= 0.6)
        {
            vec2 point2 = vec2(0.0);
            float speed = 2.0;
            color = bind_star(value1, value2, point1, point2,
                n_coord, color, brightness, speed, i);

            if (rand1d(0.9 * i) >= 0.5)
            {
                vec2 point3 = vec2(0.0);
                color = bind_star(value1, value2, point2, point3,
                    n_coord, color, brightness, 1.5 * speed, i);

                color += line(n_coord + point3, n_coord + point1, vec2(0,0),  0.0015);
            }
            
        }

        if (fract(i / 10.0) == 0.0)
        {
            color.r *= rand1d(0.2 * i, 0.2, 0.9);
            color.g *= rand1d(0.9 * i, 0.7, 0.8);
            color.b *= rand1d(2.0 * i, 0.3, 0.5);
        }
    }

    gl_FragColor = vec4(color, 1.0);
}