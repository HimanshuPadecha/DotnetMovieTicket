using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Ticket_Management_System.DTOS;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly TmsContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(TmsContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    private object BuildAuthResponse(User user)
    {
        var jwt = _configuration.GetSection("Jwt");
        var expiryMinutes = Convert.ToDouble(jwt["TokenExpiryMinutes"] ?? "120");
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.Name),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            tokenType = "Bearer",
            user = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role.Name,
                createdAt = user.CreatedAt
            }
        };
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password) || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Name, email and password are required." });

        if (dto.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            return Conflict(new { message = "Email already registered." });

        var customerRole = await _context.Roles.FirstAsync(r => r.Name == "CUSTOMER");
        var user = new User
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
            Password = dto.Password,
            RoleId = customerRole.Id
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        return Created("", BuildAuthResponse(user));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required." });

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == dto.Email.ToLower() && u.Password == dto.Password);

        if (user == null) return Unauthorized(new { message = "Invalid email or password." });

        return Ok(BuildAuthResponse(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim == null || !int.TryParse(idClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return Unauthorized(new { message = "User not found." });

        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role.Name,
            createdAt = user.CreatedAt
        });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO dto)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim == null || !int.TryParse(idClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Name and email are required." });

        var emailTaken = await _context.Users.AnyAsync(u =>
            u.Id != userId && u.Email.ToLower() == dto.Email.ToLower());
        if (emailTaken) return Conflict(new { message = "Email already in use." });

        user.Name = dto.Name.Trim();
        user.Email = dto.Email.Trim();
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role.Name,
            createdAt = user.CreatedAt
        });
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim == null || !int.TryParse(idClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (user.Password != dto.CurrentPassword)
            return BadRequest(new { message = "Current password is incorrect." });

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            return BadRequest(new { message = "New password must be at least 6 characters." });

        user.Password = dto.NewPassword;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Password updated successfully." });
    }
}
