using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ticket_Management_System.DTOS;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("shows")]
public class ShowsController : ControllerBase
{
    private readonly TmsContext _context;
    public ShowsController(TmsContext context) => _context = context;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetShows(
        [FromQuery] int? movieId = null,
        [FromQuery] string? city = null,
        [FromQuery] string? date = null)
    {
        var query = _context.Shows
            .Include(s => s.Movie)
            .Include(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .Where(s => s.StartTime >= DateTime.Now.AddHours(-1) && s.Movie.IsActive)
            .AsQueryable();

        if (movieId.HasValue) query = query.Where(s => s.MovieId == movieId);
        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(s => s.Screen.Theatre.City.ToLower() == city.ToLower());
        if (!string.IsNullOrWhiteSpace(date) && DateTime.TryParse(date, out var day))
        {
            var start = day.Date;
            var end = start.AddDays(1);
            query = query.Where(s => s.StartTime >= start && s.StartTime < end);
        }

        var shows = await query.OrderBy(s => s.StartTime).Select(s => new
        {
            s.Id,
            movie = new
            {
                s.Movie.Id,
                s.Movie.Title,
                s.Movie.Genre,
                s.Movie.Language,
                s.Movie.DurationMinutes,
                s.Movie.ImageUrl,
                s.Movie.Rating
            },
            theatre = new
            {
                s.Screen.Theatre.Id,
                s.Screen.Theatre.Name,
                s.Screen.Theatre.City,
                s.Screen.Theatre.Address
            },
            screenId = s.ScreenId,
            screen = s.Screen.Name,
            s.StartTime,
            s.TicketPrice,
            availableSeats = s.Screen.TotalSeats - s.Bookings
                .Where(b => b.Status == "CONFIRMED")
                .SelectMany(b => b.BookingSeats).Count()
        }).ToListAsync();

        return Ok(shows);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetShow(int id)
    {
        var show = await _context.Shows
            .Include(s => s.Movie)
            .Include(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (show == null) return NotFound(new { message = "Show not found." });

        var booked = await _context.BookingSeats
            .CountAsync(bs => bs.Booking.ShowId == id && bs.Booking.Status == "CONFIRMED");

        return Ok(new
        {
            show.Id,
            movie = new
            {
                show.Movie.Id,
                show.Movie.Title,
                show.Movie.Genre,
                show.Movie.Language,
                show.Movie.DurationMinutes,
                show.Movie.ImageUrl,
                show.Movie.BackdropUrl,
                show.Movie.Rating
            },
            theatre = new
            {
                show.Screen.Theatre.Id,
                show.Screen.Theatre.Name,
                show.Screen.Theatre.City,
                show.Screen.Theatre.Address
            },
            screenId = show.ScreenId,
            screen = show.Screen.Name,
            show.StartTime,
            show.TicketPrice,
            totalSeats = show.Screen.TotalSeats,
            availableSeats = show.Screen.TotalSeats - booked
        });
    }

    [HttpGet("{id:int}/seats")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeats(int id)
    {
        var show = await _context.Shows
            .Include(s => s.Screen).ThenInclude(sc => sc.Seats)
            .Include(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .Include(s => s.Movie)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (show == null) return NotFound(new { message = "Show not found." });

        var bookedSeatIds = await _context.BookingSeats
            .Where(bs => bs.Booking.ShowId == id && bs.Booking.Status == "CONFIRMED")
            .Select(bs => bs.SeatId)
            .ToListAsync();

        return Ok(new
        {
            showId = show.Id,
            movie = new { show.Movie.Id, show.Movie.Title, show.Movie.ImageUrl },
            theatre = show.Screen.Theatre.Name,
            city = show.Screen.Theatre.City,
            screen = show.Screen.Name,
            show.StartTime,
            show.TicketPrice,
            seats = show.Screen.Seats.OrderBy(s => s.SeatNumber).Select(s => new
            {
                s.Id,
                s.SeatNumber,
                s.SeatType,
                isBooked = bookedSeatIds.Contains(s.Id),
                priceMultiplier = s.SeatType == "PREMIUM" ? 1.25m : 1.0m
            })
        });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateShow([FromBody] ShowCreateDTO dto)
    {
        if (!await _context.Movies.AnyAsync(m => m.Id == dto.MovieId && m.IsActive))
            return BadRequest(new { message = "Invalid or inactive movieId." });
        if (!await _context.Screens.AnyAsync(s => s.Id == dto.ScreenId))
            return BadRequest(new { message = "Invalid screenId." });
        if (dto.TicketPrice <= 0)
            return BadRequest(new { message = "TicketPrice must be greater than 0." });

        var show = new Show
        {
            MovieId = dto.MovieId,
            ScreenId = dto.ScreenId,
            StartTime = dto.StartTime,
            TicketPrice = dto.TicketPrice
        };
        _context.Shows.Add(show);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetShow), new { id = show.Id }, new
        {
            show.Id,
            show.MovieId,
            show.ScreenId,
            show.StartTime,
            show.TicketPrice
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateShow(int id, [FromBody] ShowUpdateDTO dto)
    {
        var show = await _context.Shows.FindAsync(id);
        if (show == null) return NotFound(new { message = "Show not found." });
        if (dto.TicketPrice <= 0)
            return BadRequest(new { message = "TicketPrice must be greater than 0." });

        show.StartTime = dto.StartTime;
        show.TicketPrice = dto.TicketPrice;
        await _context.SaveChangesAsync();
        return Ok(new { show.Id, show.MovieId, show.ScreenId, show.StartTime, show.TicketPrice });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeleteShow(int id)
    {
        var show = await _context.Shows.FindAsync(id);
        if (show == null) return NotFound(new { message = "Show not found." });

        var hasBookings = await _context.Bookings.AnyAsync(b => b.ShowId == id && b.Status == "CONFIRMED");
        if (hasBookings)
            return Conflict(new { message = "Cannot delete show with confirmed bookings. Cancel bookings first." });

        _context.Shows.Remove(show);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Show deleted." });
    }
}
