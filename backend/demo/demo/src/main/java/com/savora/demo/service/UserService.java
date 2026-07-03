package com.savora.demo.service;

import java.util.List;

import com.savora.demo.Exception.UserException;
import com.savora.demo.modal.User;

public interface UserService {
    User getUserFromJwttoken(String token) throws UserException;

    User getCurrentUser() throws UserException;

    User getUserByEmail(String email) throws UserException;

    User getUserById(Long id) throws UserException;

    List<User> getAllUsers();

    User authenticate(String email, String rawPassword) throws UserException;

    User register(String fullName, String email, String rawPassword) throws UserException;

    User processOAuthPostLogin(String email, String fullName);

}
