package com.savora.demo.Configuration;

public class JwtConstant {
    public static final String SECRET_KEY = "sadnadsjhajdhajdhakjdhadjalkdajkdadgdsfsfsfjfj,asdadadadgrgdfgdfgd,gfdgdfgdg";
    // tao constant cho secret key dùng để ký và xác thực JWT token, nên đặt ở một
    // nơi an toàn và không nên hardcode trong code
    public static final String JWT_HEADER = "Authorization"; // tạo constant cho header chứa JWT token

}
