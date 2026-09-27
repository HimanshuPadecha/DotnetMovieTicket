using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("")]
public class HomeController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public IActionResult HowItWorks()
    {
        return Ok(new
        {
            app = "Movie Ticket Booking System",
            swagger = "/swagger",
            auth = new
            {
                register = "POST /auth/register",
                login = "POST /auth/login",
                me = "GET /auth/me",
                profile = "PUT /auth/profile",
                password = "PUT /auth/password"
            },
            sampleLogins = new
            {
                admin = new { email = "admin@cinema.com", password = "Admin@123" },
                customer = new { email = "rahul@test.com", password = "User@123" }
            }
        });
    }
}
