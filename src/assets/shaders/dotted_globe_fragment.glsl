uniform vec2 iResolution;
uniform float iTime;
uniform float uTransitionProgress; // 0 = solid, 1 = dotted wireframe

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

#define PI 3.14159265359

// Original solid shader effect
vec4 getSolidColor(vec2 fragCoord) {
    float mr = min(iResolution.x, iResolution.y);
    float zoom = 0.2;
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr / zoom;

    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;
    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
    return vec4(col, 1.0);
}

// Dotted globe effect - OPTIMIZED with more dots, no lines
vec4 getDottedGlobe(vec2 uv, vec3 normal) {
    // Calculate spherical coordinates
    float latitude = asin(clamp(normal.y, -1.0, 1.0));
    float longitude = atan(normal.z, normal.x);
    
    // Animate rotation
    longitude += iTime * 0.25;
    
    // Grid parameters - INCREASED dot density
    float latLines = 60.0;   // More latitude lines for denser dots
    float lonLines = 120.0;   // More longitude lines for denser dots
    float dotRadius = 0.12;  // Dot size - THICKER
    
    // Calculate grid positions with offset for alternating rows
    float latIndex = floor(latitude / PI * latLines + latLines * 0.5);
    float latOffset = mod(latIndex, 2.0) * 0.5; // Offset every other row
    
    float latPos = fract(latitude / PI * latLines + 0.5);
    float lonPos = fract(longitude / (2.0 * PI) * lonLines + latOffset);
    
    // Distance from grid intersection (just dots, no lines)
    float latDist = abs(latPos - 0.5) * 2.0;
    float lonDist = abs(lonPos - 0.5) * 2.0;
    
    // Create circular dots at intersections
    float dist = sqrt(latDist * latDist + lonDist * lonDist);
    float dotValue = smoothstep(dotRadius, dotRadius * 0.3, dist);
    
    // Add subtle glow around dots - INCREASED GLOW
    float glowValue = smoothstep(dotRadius * 4.0, dotRadius * 0.5, dist) * 0.5;
    
    // Combine dot and glow
    float pattern = dotValue + glowValue;
    
    // Color - bright cyan with glow
    vec3 coreColor = vec3(0.4, 0.85, 1.0);  // Bright cyan
    vec3 glowColor = vec3(0.1, 0.5, 0.9);   // Deep blue
    
    // Fresnel edge glow for 3D depth - using dot product correctly
    float fresnelDot = abs(dot(normal, vec3(0.0, 0.0, 1.0)));
    float fresnel = pow(1.0 - fresnelDot, 2.5);
    float edgeGlow = fresnel * 0.4;
    
    // Calculate final color
    vec3 dotColor = mix(glowColor, coreColor, dotValue * 2.0);
    float alpha = clamp(pattern + edgeGlow * 0.3, 0.0, 1.0);
    
    // Subtle pulsing
    alpha *= 0.85 + sin(iTime * 1.5) * 0.15;
    
    return vec4(dotColor, alpha);
}

void main() {
    // Get both effects
    vec4 solidColor = getSolidColor(gl_FragCoord.xy);
    
    // Calculate normal for dotted effect
    vec3 normal = normalize(vNormal);
    vec4 dottedColor = getDottedGlobe(vUv, normal);
    
    // Blend based on transition progress with smooth easing
    float t = clamp(uTransitionProgress, 0.0, 1.0);
    float blend = smoothstep(0.0, 1.0, t);
    
    // Mix colors and handle alpha blending
    vec3 finalColor = mix(solidColor.rgb, dottedColor.rgb, blend);
    float finalAlpha = mix(1.0, dottedColor.a, blend);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}
