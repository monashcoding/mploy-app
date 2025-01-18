package com.mac.mploy

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MployApplication

fun main(args: Array<String>) {
	runApplication<MployApplication>(*args)
}
