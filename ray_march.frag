// https://michaelwalczyk.com/blog-ray-marching.html
#ifdef GL_ES
precision mediump float;
#endif

#define N_STEPS 32
#define MIN_HIT_DIST 0.001
#define MAX_TRACE_DIST 1000.0

// uniforms
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;


float sphere_sdf(vec3 p, vec3 center, float radius)
{
    return length(p-center) - radius;
}


float plane(vec3 p)
{
    return p.y;
}


/*
 * Calculates distance from all sdfs on scene
 */
float sdf_dist(vec3 p)
{
    float displacement = 0 == 0 ? 0.0 : (sin(5.0 * p.x + u_time) + 
        0.5 * cos(5.0 * p.y) + 
        sin(3.0 * p.z + 5.0) * 0.25) / 5.0;
    float sphere = sphere_sdf(p, vec3(0.0, 1.0, 6.0), 1.0);
    float sphere2 = sphere_sdf(p, vec3(2.0, 1.0, 6.0), 1.0);
    float plane_dist = plane(p);

    float d = min(sphere + displacement, sphere2);
    return min(plane_dist, d);
}


/*
 * Returns the surface normal at the point "p"
 */
vec3 get_normal(vec3 p)
{
    const vec3 delta = vec3(0.001, 0.0, 0.0);

    float gradient_x = sdf_dist(p + delta) -
        sdf_dist(p - delta);
    float gradient_y = sdf_dist(p + delta.yxz) -
        sdf_dist(p - delta.yxz);
    float gradient_z = sdf_dist(p + delta.zyx) -
        sdf_dist(p - delta.zyx);

    return normalize(
        vec3(gradient_x, gradient_y, gradient_z)
    );
}


/*
 * Performs ray marching
 */
float ray_march(vec3 ray_origin, 
    vec3 ray_dir, out vec3 curr_pos)
{
    float dist_traveled = 0.0;

    for (int i=0; i<N_STEPS; i++)
    {
        curr_pos = ray_origin + dist_traveled * ray_dir;

        float closest_dist = sdf_dist(curr_pos);

        if (closest_dist < MIN_HIT_DIST || // hit
            dist_traveled > MAX_TRACE_DIST)
        {
            break;
        }

        dist_traveled += closest_dist;
    }

    return dist_traveled;
}


/*
 * Computes shadows by calculating if
 * there is an object between the point and
 * the light source
 */
float get_shadow(vec3 p, vec3 light_pos)
{
    vec3 curr_pos = vec3(0.0);
    float dist = ray_march(p, light_pos, curr_pos);
    float l = length(light_pos - p);
    return dist < l ? dist / l : 1.0;
}


/*
 * Lights the scene with diffuse lighting
 */
float get_lighting(vec3 p)
{
    vec3 normal = get_normal(p);
    vec3 light_pos = vec3(2.0, 2.5, 3.0);
    vec3 light_dir = normalize(light_pos - p);
    float intensity = max(
        0.0, dot(normal, light_dir)
    );

    float shadow = get_shadow(
        p + normal * 0.2, light_dir
    );

    return shadow * intensity;
}



void main()
{
    // coords are from -1 to 1
    vec2 coord = 2.0 * gl_FragCoord.xy / 
        u_resolution.xy - 1.0;
    
    vec3 cam_pos = vec3(0.0, 1.0, 0.0);
    vec3 ray_dir = vec3(coord, 1.0);

    vec3 curr_pos = vec3(0.0);
    float dist = 1.0 - 
        ray_march(cam_pos, ray_dir, curr_pos) / 12.0;
    
    vec3 color = vec3(get_lighting(curr_pos));

    gl_FragColor = vec4(color, 1.0);
}