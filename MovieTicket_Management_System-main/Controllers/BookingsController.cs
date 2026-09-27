using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ticket_Management_System.DTOS;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly TmsContext _context;
    public BookingsController(TmsContext context) => _context = context;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("ADMIN");

    [HttpPost]
    [Authorize(Roles = "CUSTOMER,ADMIN")]
    public async Task<IActionResult> Book([FromBody] BookTicketsDTO dto)
    {
        if (dto.SeatNumbers == null || dto.SeatNumbers.Count == 0)
            return BadRequest(new { message = "Select at least one seat." });

        var show = await _context.Shows
            .Include(s => s.Screen).ThenInclude(sc => sc.Seats)
            .Include(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .Include(s => s.Movie)
            .FirstOrDefaultAsync(s => s.Id == dto.ShowId);

        if (show == null) return NotFound(new { message = "Show not found." });
        if (show.StartTime < DateTime.Now.AddMinutes(-15))
            return BadRequest(new { message = "This show has already started or ended." });

        var requested = dto.SeatNumbers.Select(s => s.Trim().ToUpper()).Distinct().ToList();
        var seats = show.Screen.Seats.Where(s => requested.Contains(s.SeatNumber.ToUpper())).ToList();

        if (seats.Count != requested.Count)
        {
            var found = seats.Select(s => s.SeatNumber.ToUpper()).ToHashSet();
            var missing = requested.Where(s => !found.Contains(s));
            return BadRequest(new { message = "Invalid seat numbers.", invalid = missing });
        }

        var alreadyBooked = await _context.BookingSeats
            .Where(bs => bs.Booking.ShowId == dto.ShowId
                         && bs.Booking.Status == "CONFIRMED"
                         && seats.Select(s => s.Id).Contains(bs.SeatId))
            .Select(bs => bs.Seat.SeatNumber)
            .ToListAsync();

        if (alreadyBooked.Count > 0)
            return Conflict(new { message = "Some seats are already booked.", seats = alreadyBooked });

        decimal total = 0;
        foreach (var seat in seats)
            total += show.TicketPrice * (seat.SeatType == "PREMIUM" ? 1.25m : 1.0m);

        var booking = new Booking
        {
            BookingCode = "BK" + DateTime.UtcNow.ToString("yyMMddHHmmss") + Random.Shared.Next(10, 99),
            UserId = CurrentUserId,
            ShowId = show.Id,
            TotalAmount = Math.Round(total, 2),
            Status = "CONFIRMED"
        };
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        foreach (var seat in seats)
            _context.BookingSeats.Add(new BookingSeat { BookingId = booking.Id, SeatId = seat.Id });
        await _context.SaveChangesAsync();

        return Ok(new
        {
            booking.Id,
            booking.BookingCode,
            movie = show.Movie.Title,
            imageUrl = show.Movie.ImageUrl,
            theatre = show.Screen.Theatre.Name,
            city = show.Screen.Theatre.City,
            screen = show.Screen.Name,
            showTime = show.StartTime,
            seats = seats.Select(s => new { s.SeatNumber, s.SeatType }),
            booking.TotalAmount,
            booking.Status,
            booking.BookedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings([FromQuery] string? status = null)
    {
        var query = _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Show).ThenInclude(s => s.Movie)
            .Include(b => b.Show).ThenInclude(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.Seat)
            .AsQueryable();

        if (!IsAdmin) query = query.Where(b => b.UserId == CurrentUserId);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(b => b.Status.ToUpper() == status.ToUpper());

        var bookings = await query.OrderByDescending(b => b.BookedAt).Select(b => new
        {
            b.Id,
            b.BookingCode,
            customer = new { b.User.Id, b.User.Name, b.User.Email },
            movie = b.Show.Movie.Title,
            imageUrl = b.Show.Movie.ImageUrl,
            theatre = b.Show.Screen.Theatre.Name,
            city = b.Show.Screen.Theatre.City,
            screen = b.Show.Screen.Name,
            showTime = b.Show.StartTime,
            seats = b.BookingSeats.Select(bs => bs.Seat.SeatNumber),
            b.TotalAmount,
            b.Status,
            b.BookedAt
        }).ToListAsync();

        return Ok(bookings);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Show).ThenInclude(s => s.Movie)
            .Include(b => b.Show).ThenInclude(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.Seat)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return NotFound(new { message = "Booking not found." });
        if (!IsAdmin && booking.UserId != CurrentUserId) return Forbid();

        return Ok(new
        {
            booking.Id,
            booking.BookingCode,
            customer = new { booking.User.Id, booking.User.Name, booking.User.Email },
            movie = booking.Show.Movie.Title,
            imageUrl = booking.Show.Movie.ImageUrl,
            backdropUrl = booking.Show.Movie.BackdropUrl,
            theatre = booking.Show.Screen.Theatre.Name,
            city = booking.Show.Screen.Theatre.City,
            screen = booking.Show.Screen.Name,
            showTime = booking.Show.StartTime,
            seats = booking.BookingSeats.Select(bs => new { bs.Seat.SeatNumber, bs.Seat.SeatType }),
            booking.TotalAmount,
            booking.Status,
            booking.BookedAt
        });
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var booking = await _context.Bookings.Include(b => b.Show).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound(new { message = "Booking not found." });
        if (!IsAdmin && booking.UserId != CurrentUserId) return Forbid();
        if (booking.Status == "CANCELLED")
            return BadRequest(new { message = "Booking already cancelled." });
        if (booking.Show.StartTime < DateTime.Now)
            return BadRequest(new { message = "Cannot cancel a booking after the show has started." });

        booking.Status = "CANCELLED";
        await _context.SaveChangesAsync();
        return Ok(new
        {
            booking.Id,
            booking.BookingCode,
            booking.Status,
            message = "Booking cancelled. Seats are free again."
        });
    }
}
