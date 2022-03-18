// https://michaelwalczyk.com/blog-ray-marching.html
#ifdef GL_ES
precision mediump float;
#endif

// uniforms
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;


float sphere_sdf(vec3 p, vec3 center, float radius)
{
    return length(p-center) - radius;
}


/*
 * Calculates distance from all sdfs on scene
 */
float sdf_dist(vec3 p)
{
    float displacement = 0.0; // (sin(5.0 * p.x + u_time) + 
        // 0.5 * cos(5.0 * p.y + 2.0 * u_time) + 
        // sin(3.0 * p.z + 5.0) * 0.25) / 5.0;
    float sphere = sphere_sdf(p, vec3(0.0), 1.0);

    return sphere + displacement;
}


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


vec3 ray_march(vec3 ray_origin, vec3 ray_dir)
{
    float dist_traveled = 0.0;
    const int N_STEPS = 32;
    const float MIN_HIT_DIST = 0.001;
    const float MAX_TRACE_DIST = 1000.0;

    for (int i=0; i<N_STEPS; i++)
    {
        vec3 curr_pos = ray_origin + dist_traveled * ray_dir;

        float closest_dist = sdf_dist(curr_pos);

        if (closest_dist < MIN_HIT_DIST) // hit something
        {
            // diffuse lighting
            vec3 normal = get_normal(curr_pos);
            vec3 light_pos = vec3(2.0, -2.5, 3.0);
            vec3 light_dir = normalize(
                curr_pos - light_pos
            );
            float intensity = max(0.0,
                dot(normal, light_dir)
            );
            return intensity * vec3(1.0);
        }

        if (dist_traveled > MAX_TRACE_DIST)
        {
            break;
        }

        dist_traveled += closest_dist;
    }

    return vec3(0);
}


void main()
{
    // coords are from -1 to 1
    vec2 coord = 2.0 * gl_FragCoord.xy / 
        u_resolution.xy - 1.0;
    
    vec3 cam_pos = vec3(0.0, 0.0, -5.0);
    vec3 ray_dir = vec3(coord, 1.0);

    vec3 color = ray_march(cam_pos, ray_dir);

    gl_FragColor = vec4(color, 1.0);
}