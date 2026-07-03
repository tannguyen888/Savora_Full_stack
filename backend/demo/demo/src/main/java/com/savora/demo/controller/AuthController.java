package com.savora.demo.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.savora.demo.Configuration.JwtProvider;
import com.savora.demo.Exception.UserException;
import com.savora.demo.mapper.UserMapper;
import com.savora.demo.modal.User;
import com.savora.demo.payload.Dto.UserDto;
import com.savora.demo.payload.Request.LoginRequest;
import com.savora.demo.payload.Request.RegisterRequest;
import com.savora.demo.payload.Response.AuthResponse;
import com.savora.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) throws UserException {
        User user = userService.authenticate(request.getEmail(), request.getPassword());
        AuthResponse response = buildAuthResponse(user, "Login successful");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) throws UserException {
        User user = userService.register(request.getFullName(), request.getEmail(), request.getPassword());
        AuthResponse response = buildAuthResponse(user, "Register successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.getUserFromJwttoken(jwt);
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    @GetMapping("/login/google")
    public ResponseEntity<Void> loginGoogle(
            @RequestParam(defaultValue = "/") String redirect) {
        return ResponseEntity.status(302)
                .header("Location", "/oauth2/authorization/google?redirect=" + redirect)
                .build();
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        Authentication authToken = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority(user.getRole().name())));

        AuthResponse response = new AuthResponse();
        response.setJwt(jwtProvider.generateToken(authToken));
        response.setMessage(message);
        response.setUser(UserMapper.toDto(user));
        return response;
    }

}
