uniform vec2 iResolution;
uniform float iTime;

void mainImage(out vec4 fragColor, vec2 fragCoord) {
    // float mr = min(iResolution.x, iResolution.y);
    // float zoom = 0.2;
    // vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr / zoom;
float zoom = 0.2; 
float mr = min(iResolution.x, iResolution.y);
vec2 aspectRatio = iResolution.xy / min(iResolution.x, iResolution.y);
vec2 uv = ((fragCoord.xy - 0.5 * iResolution.xy) / (mr * zoom)) * aspectRatio;

    float d = -iTime * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
    }
    d += iTime * 0.5;
    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
    fragColor = vec4(col, 1.0);
}


// void mainImage( out vec4 o, vec2 u )
// {
//   float mr = min(iResolution.x, iResolution.y);
//     float zoom = 0.2;
//     vec2 R = iResolution.xy;
//     u = (u+u-R)/R.y;
    
//     float a, d, i;
    
//     for (; i < 8.; d += sin(i++ * u.y + a)) 
//         a += cos(i - d + .5 * iTime - a * u.x);
            
//     o.xy = .4 + .6 * cos(u * vec2(d, a));
//     o.z = .5 + .5 * cos(a + d);
             
//     o = cos(.5 + .5 * cos(vec4(d, a, 2.5, 0)) * o);
// }

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}















// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec2  vUv;

// #define PI 3.1415926535897932384626433832795

// float smoothMod(float axis, float amp, float rad){
//     float top = cos(PI * (axis / amp)) * sin(PI * (axis / amp));
//     float bottom = pow(sin(PI * (axis / amp)), 2.0) + pow(rad, 2.0);
//     float at = atan(top / bottom);
//     return amp * (1.0 / 2.0) - (1.0 / PI) * at;
// }

// void main(){
//   vec2 uv = vUv;
//   gl_FragColor = vec4(vec3(smoothMod(uv.y *1.0,1.0, 1.0  )),1);
// }
