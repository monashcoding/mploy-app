package com.mac.mploy.controller

import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("/api")
class HelloController(private val redis: StringRedisTemplate) {
    @GetMapping("/hello")
    fun hello(): String {
        return redis.opsForValue().get("greeting") ?: "Hello from Redis!"
    }
}