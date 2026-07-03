package com.savora.demo.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.savora.demo.Configuration.JwtProvider;
import com.savora.demo.Exception.UserException;
import com.savora.demo.modal.User;
import com.savora.demo.modal.enums.UserRole;
import com.savora.demo.payload.Dto.UserDto;
import com.savora.demo.payload.Request.LoginRequest;
import com.savora.demo.payload.Request.RegisterRequest;
import com.savora.demo.payload.Response.AuthResponse;
import com.savora.demo.service.UserService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtProvider jwtProvider;

    @InjectMocks
    private AuthController authController;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("user@example.com");
        mockUser.setFullName("Test User");
        mockUser.setRole(UserRole.USER);
        mockUser.setPassword("encoded-password");
    }

    @Test
    void loginShouldReturnJwtAndUser() throws UserException {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        when(userService.authenticate("user@example.com", "password123")).thenReturn(mockUser);
        when(jwtProvider.generateToken(any())).thenReturn("mock-jwt");

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("mock-jwt", response.getBody().getJwt());
        assertEquals("Login successful", response.getBody().getMessage());
        assertEquals("user@example.com", response.getBody().getUser().getEmail());
        assertEquals("Test User", response.getBody().getUser().getFullName());
    }

    @Test
    void registerShouldReturnJwtAndUser() throws UserException {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");
        request.setFullName("Test User");

        when(userService.register("Test User", "user@example.com", "password123")).thenReturn(mockUser);
        when(jwtProvider.generateToken(any())).thenReturn("register-jwt");

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("register-jwt", response.getBody().getJwt());
        assertEquals("Register successful", response.getBody().getMessage());
        assertEquals("user@example.com", response.getBody().getUser().getEmail());
    }

    @Test
    void meShouldReturnUserDto() throws UserException {
        when(userService.getUserFromJwttoken("Bearer abc")).thenReturn(mockUser);

        ResponseEntity<UserDto> response = authController.me("Bearer abc");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("user@example.com", response.getBody().getEmail());
        assertEquals("Test User", response.getBody().getFullName());
    }

    @Test
    void loginGoogleShouldReturnRedirectResponse() {
        ResponseEntity<Void> response = authController.loginGoogle("/");

        assertEquals(302, response.getStatusCode().value());
        assertEquals("/oauth2/authorization/google?redirect=/", response.getHeaders().getFirst("Location"));
    }
}
