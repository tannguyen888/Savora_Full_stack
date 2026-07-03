package com.savora.demo.payload.Response;

import com.savora.demo.payload.Dto.UserDto;
import lombok.Data;

@Data
public class AuthResponse {
    private String jwt;
    private String message;
    private UserDto user;

}
