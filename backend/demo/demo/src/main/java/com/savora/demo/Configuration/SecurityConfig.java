package com.savora.demo.Configuration;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.util.StringUtils;

import com.savora.demo.modal.User;
import com.savora.demo.service.CustomOAuth2User;
import com.savora.demo.service.UserService;
import com.savora.demo.service.implementService.CustomOAuth2UserService;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomOAuth2UserService oauthUserService;
    private final UserService userService;
    private final JwtProvider jwtProvider;

    @Value("${frontend.base.url}")
    private String frontendBaseUrl;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private String normalizeSuccessRedirect(String requestedRedirect) {
        if (!StringUtils.hasText(requestedRedirect)) {
            return frontendBaseUrl + "/oauth-success";
        }

        String value = requestedRedirect.trim();
        if (value.startsWith("/")) {
            return frontendBaseUrl + value;
        }

        try {
            URI uri = URI.create(value);
            String host = uri.getHost();
            if (host == null) {
                return frontendBaseUrl + "/oauth-success";
            }

            boolean isLocalhost = "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host);
            if (isLocalhost) {
                return value;
            }

            List<String> origins = Stream.of(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            String origin = uri.getScheme() + "://" + uri.getHost()
                    + (uri.getPort() > 0 ? ":" + uri.getPort() : "");

            if (origins.contains(origin)) {
                return value;
            }
        } catch (Exception ignored) {
        }

        return frontendBaseUrl + "/oauth-success";
    }

    private String toLoginErrorUrl(String successRedirectBase) {
        try {
            URI uri = URI.create(successRedirectBase);
            String origin = uri.getScheme() + "://" + uri.getHost()
                    + (uri.getPort() > 0 ? ":" + uri.getPort() : "");
            return origin + "/login?error=oauth_failed";
        } catch (Exception ignored) {
            return frontendBaseUrl + "/login?error=oauth_failed";
        }
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(user -> user.userService(oauthUserService))
                        .successHandler((request, response, authentication) -> {
                            CustomOAuth2User oauthUser = (CustomOAuth2User) authentication.getPrincipal();
                            String email = oauthUser.getEmail();

                            User user = userService.processOAuthPostLogin(email, oauthUser.getName());
                            Authentication authToken = new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    List.of(new SimpleGrantedAuthority(user.getRole().name())));

                            String jwt = jwtProvider.generateToken(authToken);
                            String requestedRedirect = (String) request.getSession().getAttribute("oauth_redirect");
                            request.getSession().removeAttribute("oauth_redirect");
                            String successBase = normalizeSuccessRedirect(requestedRedirect);
                            String separator = successBase.contains("?") ? "&" : "?";
                            String redirectUrl = successBase + separator + "token=" + jwt;
                            response.sendRedirect(redirectUrl);
                        })
                        .failureHandler((request, response, exception) -> {
                            String requestedRedirect = (String) request.getSession().getAttribute("oauth_redirect");
                            request.getSession().removeAttribute("oauth_redirect");
                            String successBase = normalizeSuccessRedirect(requestedRedirect);
                            String redirectUrl = toLoginErrorUrl(successBase);
                            response.sendRedirect(redirectUrl);
                        }))

                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**", "/oauth2/**", "/login/**", "/error").permitAll()
                        .anyRequest().permitAll())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration configuration = new CorsConfiguration();
            List<String> origins = Stream.of(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            configuration.setAllowedOrigins(origins);
            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(List.of("*"));
            configuration.setAllowCredentials(true);
            return configuration;
        };
    }
}
