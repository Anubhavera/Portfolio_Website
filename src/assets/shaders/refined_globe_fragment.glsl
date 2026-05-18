// refined_globe_fragment.glsl
// ─────────────────────────────────────────────────────────────
// Same as dotted_globe_fragment.glsl, with two changes:
//   1. The iridescent pattern is anchored to the sphere's
//      projected screen position (uSphereScreen) instead of
//      raw gl_FragCoord, so the colors track the sphere when
//      the camera parallaxes.
//   2. A couple of hand-tunable constants pulled to the top
//      so you can dial the look without re-reading the math.
// ─────────────────────────────────────────────────────────────

uniform vec2  iResolution;
uniform float iTime;
uniform float uTransitionProgress;   // 0 = solid iridescent, 1 = dotted wireframe
uniform vec2  uSphereScreen;         // sphere center in pixel coords (set from JS)

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

#define PI 3.14159265359

/* ── tweakables ─────────────────────────────────────────────── */
const float PATTERN_ZOOM      = 0.22;   // ↑ = pattern features smaller. mockup used 0.20
const float PATTERN_SPEED     = 0.50;   // pattern animation speed
const float PATTERN_SATURATE  = 1.05;   // >1 = punchier colors
/* ───────────────────────────────────────────────────────────── */

vec4 getSolidColor(vec2 fragCoord) {
    float mr = min(iResolution.x, iResolution.y);

    // Re-center fragCoord on the sphere's screen position so the
    // pattern's "origin" sits on the sphere — not the viewport center.
    vec2 anchored = fragCoord - uSphereScreen + iResolution.xy * 0.5;
    vec2 uv = (anchored * 2.0 - iResolution.xy) / mr / PATTERN_ZOOM;

    float d = -iTime * PATTERN_SPEED;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
    }
    d += iTime * PATTERN_SPEED;
    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

    // Gentle saturation boost around mid-grey
    col = mix(vec3(dot(col, vec3(0.3, 0.59, 0.11))), col, PATTERN_SATURATE);

    return vec4(col, 1.0);
}

/* ── dotted-wireframe state (unchanged from your original) ─── */
vec4 getDottedGlobe(vec2 uv, vec3 normal) {
    float latitude  = asin(clamp(normal.y, -1.0, 1.0));
    float longitude = atan(normal.z, normal.x);
    longitude += iTime * 0.25;

    float latLines  = 60.0;
    float lonLines  = 120.0;
    float dotRadius = 0.12;

    float latIndex  = floor(latitude / PI * latLines + latLines * 0.5);
    float latOffset = mod(latIndex, 2.0) * 0.5;

    float latPos = fract(latitude / PI * latLines + 0.5);
    float lonPos = fract(longitude / (2.0 * PI) * lonLines + latOffset);

    float latDist = abs(latPos - 0.5) * 2.0;
    float lonDist = abs(lonPos - 0.5) * 2.0;

    float dist     = sqrt(latDist * latDist + lonDist * lonDist);
    float dotValue = smoothstep(dotRadius, dotRadius * 0.3, dist);
    float glow     = smoothstep(dotRadius * 4.0, dotRadius * 0.5, dist) * 0.5;
    float pattern  = dotValue + glow;

    vec3 coreColor = vec3(0.4, 0.85, 1.0);
    vec3 glowColor = vec3(0.1, 0.5, 0.9);

    float fresnelDot = abs(dot(normal, vec3(0.0, 0.0, 1.0)));
    float fresnel    = pow(1.0 - fresnelDot, 2.5);
    float edgeGlow   = fresnel * 0.4;

    vec3  dotColor   = mix(glowColor, coreColor, dotValue * 2.0);
    float alpha      = clamp(pattern + edgeGlow * 0.3, 0.0, 1.0);
    alpha *= 0.85 + sin(iTime * 1.5) * 0.15;

    return vec4(dotColor, alpha);
}

void main() {
    vec4 solidColor  = getSolidColor(gl_FragCoord.xy);
    vec3 normal      = normalize(vNormal);
    vec4 dottedColor = getDottedGlobe(vUv, normal);

    float t     = clamp(uTransitionProgress, 0.0, 1.0);
    float blend = smoothstep(0.0, 1.0, t);

    vec3  finalColor = mix(solidColor.rgb, dottedColor.rgb, blend);
    float finalAlpha = mix(1.0, dottedColor.a, blend);

    gl_FragColor = vec4(finalColor, finalAlpha);
}
