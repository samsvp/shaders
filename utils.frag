#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.1415926535;

uniform float u_time;
uniform vec2 u_resolution;


float rand1d(float v)
{
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

/*
 * Generates a random number between 0 and 1
 */
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


/*
 * Scales the given coordinates by s
 */
vec2 scale(float s, vec2 coord)
{
    return coord / s;
}


void main()
{

}