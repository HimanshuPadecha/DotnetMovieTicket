using Microsoft.EntityFrameworkCore;

namespace Ticket_Management_System.Models;

public class TmsContext : DbContext
{
    public TmsContext(DbContextOptions<TmsContext> options) : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Theatre> Theatres => Set<Theatre>();
    public DbSet<Screen> Screens => Set<Screen>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Show> Shows => Set<Show>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingSeat> BookingSeats => Set<BookingSeat>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Name).HasMaxLength(30);
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Name).HasMaxLength(100);
            e.Property(x => x.Email).HasMaxLength(255);
            e.Property(x => x.Password).HasMaxLength(255);
            e.HasOne(x => x.Role).WithMany(r => r.Users).HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Movie>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Genre).HasMaxLength(50);
            e.Property(x => x.Language).HasMaxLength(50);
            e.Property(x => x.Rating).HasMaxLength(10);
            e.Property(x => x.ImageUrl).HasMaxLength(500);
            e.Property(x => x.BackdropUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Theatre>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(150);
            e.Property(x => x.City).HasMaxLength(80);
            e.Property(x => x.Address).HasMaxLength(255);
        });

        modelBuilder.Entity<Screen>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(50);
            e.HasOne(x => x.Theatre).WithMany(t => t.Screens).HasForeignKey(x => x.TheatreId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Seat>(e =>
        {
            e.Property(x => x.SeatNumber).HasMaxLength(10);
            e.Property(x => x.SeatType).HasMaxLength(20);
            e.HasIndex(x => new { x.ScreenId, x.SeatNumber }).IsUnique();
            e.HasOne(x => x.Screen).WithMany(s => s.Seats).HasForeignKey(x => x.ScreenId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Show>(e =>
        {
            e.Property(x => x.TicketPrice).HasPrecision(10, 2);
            e.HasOne(x => x.Movie).WithMany(m => m.Shows).HasForeignKey(x => x.MovieId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Screen).WithMany(s => s.Shows).HasForeignKey(x => x.ScreenId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.HasIndex(x => x.BookingCode).IsUnique();
            e.Property(x => x.BookingCode).HasMaxLength(20);
            e.Property(x => x.Status).HasMaxLength(20);
            e.Property(x => x.TotalAmount).HasPrecision(10, 2);
            e.HasOne(x => x.User).WithMany(u => u.Bookings).HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Show).WithMany(s => s.Bookings).HasForeignKey(x => x.ShowId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BookingSeat>(e =>
        {
            e.HasOne(x => x.Booking).WithMany(b => b.BookingSeats).HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Seat).WithMany(s => s.BookingSeats).HasForeignKey(x => x.SeatId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.BookingId, x.SeatId }).IsUnique();
        });
    }
}
