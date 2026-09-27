using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly TmsContext _context;
    public AdminController(TmsContext context) => _context = context;

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var now = DateTime.Now;
        var stats = new
        {
            totalMovies = await _context.Movies.CountAsync(m => m.IsActive),
            totalTheatres = await _context.Theatres.CountAsync(),
            totalShows = await _context.Shows.CountAsync(s => s.StartTime >= now),
            totalUsers = await _context.Users.CountAsync(),
            confirmedBookings = await _context.Bookings.CountAsync(b => b.Status == "CONFIRMED"),
            cancelledBookings = await _context.Bookings.CountAsync(b => b.Status == "CANCELLED"),
            revenue = await _context.Bookings.Where(b => b.Status == "CONFIRMED").SumAsync(b => (decimal?)b.TotalAmount) ?? 0,
            recentBookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Show).ThenInclude(s => s.Movie)
                .OrderByDescending(b => b.BookedAt)
                .Take(8)
                .Select(b => new
                {
                    b.Id,
                    b.BookingCode,
                    customer = b.User.Name,
                    movie = b.Show.Movie.Title,
                    b.TotalAmount,
                    b.Status,
                    b.BookedAt
                }).ToListAsync()
        };
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.Include(u => u.Role)
            .OrderBy(u => u.Name)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                role = u.Role.Name,
                u.CreatedAt,
                bookingsCount = u.Bookings.Count
            }).ToListAsync();
        return Ok(users);
    }
}
